"""
Assessment service - handles assessment creation, question serving, and answer evaluation.
Answer keys are validated on the backend only. Correct answers are never sent before submission.
"""
import json
from typing import Optional, List, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.assessment import AssessmentSession, StudentResponse, MasteryRecord
from app.models.question import Question, AnswerChoice
from app.models.concept import Concept, Topic
from app.models.learning import LearningEvent


def create_assessment(db: Session, user_id: int, topic_id: Optional[int] = None,
                       session_type: str = "diagnostic", parent_session_id: Optional[int] = None) -> AssessmentSession:
    """Create a new assessment session."""
    if topic_id is None:
        topic = db.query(Topic).first()
        if topic is None:
            raise ValueError("No topics available")
        topic_id = topic.id

    session = AssessmentSession(
        user_id=user_id,
        topic_id=topic_id,
        session_type=session_type,
        status="in_progress",
        parent_session_id=parent_session_id,
    )
    db.add(session)
    db.flush()

    # Log event
    db.add(LearningEvent(
        user_id=user_id,
        event_type="assessment_started",
        entity_type="assessment",
        entity_id=session.id,
        metadata_json=json.dumps({"session_type": session_type}),
    ))
    db.commit()
    return session


def get_next_question(db: Session, assessment_id: int, user_id: int) -> Optional[dict]:
    """Get the next unanswered question for an assessment. Never includes correct answer."""
    session = db.query(AssessmentSession).filter(
        AssessmentSession.id == assessment_id,
        AssessmentSession.user_id == user_id,
    ).first()
    if not session or session.status == "completed":
        return None

    # Get already answered question IDs in this session
    answered_ids = db.query(StudentResponse.question_id).filter(
        StudentResponse.assessment_id == assessment_id,
    ).all()
    answered_ids = [r[0] for r in answered_ids]

    # Get next question for this topic, excluding already answered
    query = db.query(Question).filter(
        Question.topic_id == session.topic_id,
    )
    if answered_ids:
        query = query.filter(~Question.id.in_(answered_ids))

    # Compute adaptive difficulty based on student's session history
    recent_responses = db.query(StudentResponse).filter(
        StudentResponse.assessment_id == assessment_id,
        StudentResponse.user_id == user_id,
    ).order_by(StudentResponse.question_order.asc()).all()

    target_difficulty = "easy"
    selection_reason = "Selected Easy difficulty benchmark to establish baseline concept understanding."
    rule_applied = "initial_baseline"
    streak_correct = 0

    if recent_responses:
        last_resp = recent_responses[-1]
        last_q = db.query(Question).filter(Question.id == last_resp.question_id).first()
        last_diff = last_q.difficulty if last_q else "easy"
        concept_name = ""
        if last_q and last_q.concept_id:
            c = db.query(Concept).filter(Concept.id == last_q.concept_id).first()
            if c:
                concept_name = c.name

        # Calculate consecutive correct answers
        for r in reversed(recent_responses):
            if r.is_correct:
                streak_correct += 1
            else:
                break

        if last_resp.is_correct:
            if last_diff == "easy":
                target_difficulty = "medium"
                c_phrase = f" {concept_name}" if concept_name else ""
                selection_reason = f"Advanced from Easy to Medium difficulty because you answered the previous{c_phrase} question correctly."
                rule_applied = "gradual_advancement_easy_to_medium"
            elif last_diff == "medium":
                if streak_correct >= 2:
                    target_difficulty = "hard"
                    selection_reason = f"Promoted to Hard difficulty after {streak_correct} consecutive correct answers demonstrating reliable comprehension."
                    rule_applied = "gradual_advancement_medium_to_hard"
                else:
                    target_difficulty = "medium"
                    selection_reason = "Maintaining Medium difficulty to reinforce problem-solving consistency before advancing to complex composite rules."
                    rule_applied = "consolidate_medium_difficulty"
            else:  # hard
                target_difficulty = "hard"
                selection_reason = "Continuing with Hard challenge questions to assess competitive JEE Advanced readiness."
                rule_applied = "maintain_hard_difficulty"
        else:
            if last_diff == "hard":
                target_difficulty = "medium"
                selection_reason = "Adjusted difficulty from Hard to Medium to reinforce intermediate steps before re-attempting composite calculus."
                rule_applied = "recovery_demotion_hard_to_medium"
            elif last_diff == "medium":
                target_difficulty = "easy"
                selection_reason = "Calibrated difficulty to Easy to repair fundamental rules and prevent prerequisite gaps."
                rule_applied = "recovery_demotion_medium_to_easy"
            else:
                target_difficulty = "easy"
                selection_reason = "Maintaining foundational Easy difficulty to isolate and repair core concept definitions."
                rule_applied = "reinforce_foundation_easy"

    # For diagnostic sessions, prioritize questions from different concepts first
    if session.session_type == "diagnostic":
        tested_concepts = db.query(Question.concept_id).filter(
            Question.id.in_(answered_ids)
        ).distinct().all() if answered_ids else []
        tested_concept_ids = [c[0] for c in tested_concepts]

        # First try to find a question matching target_difficulty from an untested concept
        untested_adaptive_q = query.filter(
            ~Question.concept_id.in_(tested_concept_ids),
            Question.difficulty == target_difficulty,
        ).first() if tested_concept_ids else None

        if not untested_adaptive_q and tested_concept_ids:
            untested_adaptive_q = query.filter(~Question.concept_id.in_(tested_concept_ids)).first()

        # If all concepts tested, find question matching target difficulty
        adaptive_q = query.filter(Question.difficulty == target_difficulty).first()
        question = untested_adaptive_q or adaptive_q or query.first()
    else:
        # For practice / follow-up sessions, strictly prioritize target_difficulty
        adaptive_q = query.filter(Question.difficulty == target_difficulty).first()
        question = adaptive_q or query.first()

    if not question:
        return None

    # Get choices - do NOT include is_correct
    choices = db.query(AnswerChoice).filter(
        AnswerChoice.question_id == question.id
    ).order_by(AnswerChoice.label).all()

    concept = db.query(Concept).filter(Concept.id == question.concept_id).first()

    return {
        "id": question.id,
        "question_text": question.question_text,
        "difficulty": question.difficulty,
        "question_type": question.question_type,
        "choices": [{"label": c.label, "text": c.text} for c in choices],
        "hint_1": question.hint_1,
        "hint_2": question.hint_2,
        "hint_3": question.hint_3,
        "concept_name": concept.name if concept else None,
        "question_number": len(answered_ids) + 1,
        "total_available": db.query(Question).filter(Question.topic_id == session.topic_id).count(),
        "selection_reason": selection_reason,
        "adaptation_telemetry": {
            "target_difficulty": target_difficulty,
            "actual_difficulty": question.difficulty,
            "streak_correct": streak_correct,
            "rule_applied": rule_applied,
        },
    }


def submit_answer(db: Session, assessment_id: int, user_id: int,
                   question_id: int, selected_answer: str,
                   response_time_seconds: Optional[float] = None,
                   hint_used: bool = False, hints_revealed: int = 0) -> dict:
    """Evaluate and record an answer. Validation happens on the backend."""
    # Verify assessment belongs to user
    session = db.query(AssessmentSession).filter(
        AssessmentSession.id == assessment_id,
        AssessmentSession.user_id == user_id,
        AssessmentSession.status == "in_progress",
    ).first()
    if not session:
        raise ValueError("Assessment not found or already completed")

    # Check for duplicate submission
    existing = db.query(StudentResponse).filter(
        StudentResponse.assessment_id == assessment_id,
        StudentResponse.question_id == question_id,
    ).first()
    if existing:
        raise ValueError("Question already answered in this assessment")

    # Get question and validate answer on backend
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise ValueError("Question not found")

    is_correct = selected_answer.strip().upper() == question.correct_answer.strip().upper()

    # Get the answer count for ordering
    answer_count = db.query(StudentResponse).filter(
        StudentResponse.assessment_id == assessment_id,
    ).count()

    # Record the response
    response = StudentResponse(
        assessment_id=assessment_id,
        user_id=user_id,
        question_id=question_id,
        selected_answer=selected_answer,
        is_correct=is_correct,
        response_time_seconds=response_time_seconds,
        hint_used=hint_used,
        hints_revealed=hints_revealed,
        question_order=answer_count + 1,
    )
    db.add(response)

    # Update session counts
    session.total_questions += 1
    if is_correct:
        session.correct_answers += 1
    session.accuracy = session.correct_answers / session.total_questions if session.total_questions > 0 else 0.0

    # Update mastery
    _update_mastery(db, user_id, question.concept_id, is_correct)

    # Log event
    db.add(LearningEvent(
        user_id=user_id,
        event_type="question_answered",
        entity_type="question",
        entity_id=question_id,
        metadata_json=json.dumps({
            "is_correct": is_correct,
            "assessment_id": assessment_id,
        }),
    ))
    db.commit()

    # Get misconception tag if wrong
    misconception_tag = None
    if not is_correct:
        choice = db.query(AnswerChoice).filter(
            AnswerChoice.question_id == question_id,
            AnswerChoice.label == selected_answer.strip().upper(),
        ).first()
        if choice:
            misconception_tag = choice.misconception_tag

    concept = db.query(Concept).filter(Concept.id == question.concept_id).first()

    return {
        "response_id": response.id,
        "is_correct": is_correct,
        "correct_answer": question.correct_answer,
        "explanation": question.explanation,
        "misconception_tag": misconception_tag,
        "concept_name": concept.name if concept else "Unknown",
    }


def complete_assessment(db: Session, assessment_id: int, user_id: int) -> dict:
    """Complete an assessment and generate a summary."""
    session = db.query(AssessmentSession).filter(
        AssessmentSession.id == assessment_id,
        AssessmentSession.user_id == user_id,
    ).first()
    if not session:
        raise ValueError("Assessment not found")

    session.status = "completed"
    session.completed_at = datetime.now(timezone.utc)
    db.commit()

    # Generate summary
    responses = db.query(StudentResponse).filter(
        StudentResponse.assessment_id == assessment_id,
    ).all()

    concepts_assessed = set()
    weak_concepts = set()
    strong_concepts = set()

    for resp in responses:
        question = db.query(Question).filter(Question.id == resp.question_id).first()
        if question:
            concept = db.query(Concept).filter(Concept.id == question.concept_id).first()
            if concept:
                concepts_assessed.add(concept.name)
                if resp.is_correct:
                    strong_concepts.add(concept.name)
                else:
                    weak_concepts.add(concept.name)

    # Remove concepts that are both strong and weak (mixed results) from strong
    mixed = strong_concepts & weak_concepts
    strong_concepts -= mixed
    weak_concepts |= mixed  # Keep in weak if mixed

    recommendations = []
    for concept_name in weak_concepts:
        recommendations.append(f"Review and practice: {concept_name}")
    if not weak_concepts:
        recommendations.append("Great job! Try more advanced problems.")

    return {
        "assessment": {
            "id": session.id,
            "topic_id": session.topic_id,
            "session_type": session.session_type,
            "status": session.status,
            "total_questions": session.total_questions,
            "correct_answers": session.correct_answers,
            "accuracy": round(session.accuracy * 100, 1),
            "started_at": session.started_at.isoformat() if session.started_at else None,
            "completed_at": session.completed_at.isoformat() if session.completed_at else None,
        },
        "questions_answered": len(responses),
        "correct_count": session.correct_answers,
        "accuracy": round(session.accuracy * 100, 1),
        "concepts_assessed": list(concepts_assessed),
        "weak_concepts": list(weak_concepts),
        "strong_concepts": list(strong_concepts),
        "recommendations": recommendations,
    }


def _update_mastery(db: Session, user_id: int, concept_id: int, is_correct: bool):
    """Update mastery record using a transparent rule-based model.

    Mastery levels:
    - unassessed: No attempts
    - needs_practice: accuracy < 40% or fewer than 2 attempts
    - developing: accuracy 40-79% with at least 2 attempts
    - mastered: accuracy >= 80% with at least 3 attempts
    """
    record = db.query(MasteryRecord).filter(
        MasteryRecord.user_id == user_id,
        MasteryRecord.concept_id == concept_id,
    ).first()

    if not record:
        record = MasteryRecord(
            user_id=user_id,
            concept_id=concept_id,
            total_attempts=0,
            correct_attempts=0,
            confidence_score=0.0,
            mastery_level="unassessed",
        )
        db.add(record)

    record.total_attempts = (record.total_attempts or 0) + 1
    record.correct_attempts = (record.correct_attempts or 0) + (1 if is_correct else 0)
    record.last_assessed_at = datetime.now(timezone.utc)

    # Calculate mastery level using transparent rules
    accuracy = record.correct_attempts / record.total_attempts if record.total_attempts > 0 else 0
    record.confidence_score = round(accuracy, 2)

    if record.total_attempts < 2:
        record.mastery_level = "needs_practice"
    elif accuracy >= 0.8 and record.total_attempts >= 3:
        record.mastery_level = "mastered"
    elif accuracy >= 0.4:
        record.mastery_level = "developing"
    else:
        record.mastery_level = "needs_practice"

    db.flush()
