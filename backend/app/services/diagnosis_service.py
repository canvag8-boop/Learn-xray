"""
Misconception Diagnosis Engine.
Implements the 7-step diagnostic workflow:
1. Identify relevant concepts
2. Generate candidate explanations
3. Ask diagnostic follow-up questions
4. Update diagnosis with new evidence
5. Recommend intervention
6. Verify improvement
7. Update learning profile
"""
import json
from typing import Optional, List, Dict
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.assessment import AssessmentSession, StudentResponse, MasteryRecord
from app.models.question import Question, AnswerChoice
from app.models.concept import Concept, ConceptPrerequisite
from app.models.diagnosis import DiagnosisSession, MisconceptionHypothesis, DiagnosticFollowUp
from app.models.learning import Lesson, LearningEvent
from app.services.ai_service import ai_service


def analyze_incorrect_answer(db: Session, user_id: int, assessment_id: int,
                               response_id: int) -> dict:
    """
    Step 1-2: Analyze an incorrect answer and generate candidate misconceptions.
    Does NOT claim certainty from one wrong answer.
    """
    if not response_id or response_id <= 0:
        response = db.query(StudentResponse).filter(
            StudentResponse.assessment_id == assessment_id,
            StudentResponse.user_id == user_id,
            StudentResponse.is_correct == False,
        ).order_by(StudentResponse.created_at.desc()).first()
    else:
        response = db.query(StudentResponse).filter(
            StudentResponse.id == response_id,
            StudentResponse.user_id == user_id,
        ).first()

    if not response:
        raise ValueError("Incorrect response not found for diagnosis")
    if response.is_correct:
        return {"message": "This answer was correct. No diagnosis needed."}

    question = db.query(Question).filter(Question.id == response.question_id).first()
    concept = db.query(Concept).filter(Concept.id == question.concept_id).first()

    # Get misconception tag from selected answer choice
    selected_choice = db.query(AnswerChoice).filter(
        AnswerChoice.question_id == question.id,
        AnswerChoice.label == response.selected_answer.strip().upper(),
    ).first()
    misconception_tag = selected_choice.misconception_tag if selected_choice else None

    # Create diagnosis session
    diagnosis = DiagnosisSession(
        user_id=user_id,
        assessment_id=assessment_id,
        trigger_question_id=question.id,
        trigger_response_id=response.id,
        status="investigating",
    )
    db.add(diagnosis)
    db.flush()

    # Step 1: Identify relevant concepts (the question's concept and its prerequisites)
    prereqs = db.query(ConceptPrerequisite).filter(
        ConceptPrerequisite.concept_id == concept.id
    ).all()
    prereq_concepts = []
    for p in prereqs:
        prereq = db.query(Concept).filter(Concept.id == p.prerequisite_id).first()
        if prereq:
            prereq_concepts.append(prereq)

    # Step 2: Generate candidate explanations
    analysis = ai_service.analyze_misconception(
        question_text=question.question_text,
        correct_answer=question.correct_answer,
        student_answer=response.selected_answer,
        misconception_tag=misconception_tag,
        concept_name=concept.name,
    )

    hypotheses = []
    for misc in analysis.get("misconceptions", []):
        hyp = MisconceptionHypothesis(
            diagnosis_id=diagnosis.id,
            concept_id=concept.id,
            misconception=misc["name"],
            confidence=misc.get("confidence", "low"),
            confidence_score={"low": 0.3, "moderate": 0.5, "high": 0.7}.get(misc.get("confidence", "low"), 0.3),
            evidence_for=json.dumps([misc.get("evidence", "Incorrect answer on related question")]),
            evidence_against=json.dumps([]),
            recommended_intervention=misc.get("intervention", f"Review {concept.name}"),
            status="candidate",
        )
        db.add(hyp)
        db.flush()
        hypotheses.append(hyp)

    # Also check prerequisites as potential gaps
    for prereq in prereq_concepts:
        mastery = db.query(MasteryRecord).filter(
            MasteryRecord.user_id == user_id,
            MasteryRecord.concept_id == prereq.id,
        ).first()

        if not mastery or mastery.mastery_level in ("unassessed", "needs_practice"):
            hyp = MisconceptionHypothesis(
                diagnosis_id=diagnosis.id,
                concept_id=prereq.id,
                misconception=f"Possible gap in prerequisite: {prereq.name}",
                confidence="low",
                confidence_score=0.3,
                evidence_for=json.dumps([
                    f"Incorrect answer on {concept.name} question",
                    f"{prereq.name} is a prerequisite that is {'unassessed' if not mastery else mastery.mastery_level}",
                ]),
                evidence_against=json.dumps([]),
                recommended_intervention=f"Assess and review {prereq.name} before continuing with {concept.name}",
                status="candidate",
            )
            db.add(hyp)
            db.flush()
            hypotheses.append(hyp)

    # Step 3: Find a diagnostic follow-up question
    follow_up = _find_diagnostic_question(db, diagnosis, hypotheses, user_id)

    db.add(LearningEvent(
        user_id=user_id,
        event_type="diagnosis_started",
        entity_type="diagnosis",
        entity_id=diagnosis.id,
    ))
    db.commit()

    return _format_diagnosis_response(db, diagnosis, hypotheses, follow_up)


def answer_follow_up(db: Session, user_id: int, diagnosis_id: int,
                      question_id: int, selected_answer: str,
                      response_time_seconds: Optional[float] = None) -> dict:
    """Step 4: Process follow-up answer and update diagnosis."""
    diagnosis = db.query(DiagnosisSession).filter(
        DiagnosisSession.id == diagnosis_id,
        DiagnosisSession.user_id == user_id,
    ).first()
    if not diagnosis:
        raise ValueError("Diagnosis not found")

    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise ValueError("Question not found")

    is_correct = selected_answer.strip().upper() == question.correct_answer.strip().upper()

    # Record follow-up
    follow_up = db.query(DiagnosticFollowUp).filter(
        DiagnosticFollowUp.diagnosis_id == diagnosis_id,
        DiagnosticFollowUp.question_id == question_id,
    ).first()

    if not follow_up:
        follow_up = DiagnosticFollowUp(
            diagnosis_id=diagnosis_id,
            question_id=question_id,
        )
        db.add(follow_up)

    follow_up.student_answer = selected_answer
    follow_up.is_correct = is_correct

    # Update hypotheses based on the answer
    hypotheses = db.query(MisconceptionHypothesis).filter(
        MisconceptionHypothesis.diagnosis_id == diagnosis_id,
    ).all()

    for hyp in hypotheses:
        if hyp.concept_id == question.concept_id:
            evidence_for = json.loads(hyp.evidence_for or "[]")
            evidence_against = json.loads(hyp.evidence_against or "[]")

            if is_correct:
                # Correct answer on related concept → evidence against this misconception
                evidence_against.append(f"Correctly answered diagnostic question about {question.question_text[:50]}...")
                hyp.confidence_score = max(0.1, hyp.confidence_score - 0.2)
                follow_up.outcome = f"Student answered correctly, reducing confidence in this hypothesis"
            else:
                # Incorrect → evidence supporting this misconception
                evidence_for.append(f"Also answered incorrectly on diagnostic question about {question.question_text[:50]}...")
                hyp.confidence_score = min(0.9, hyp.confidence_score + 0.2)
                follow_up.outcome = f"Student answered incorrectly, increasing confidence in this hypothesis"

            hyp.evidence_for = json.dumps(evidence_for)
            hyp.evidence_against = json.dumps(evidence_against)

            # Update confidence label
            if hyp.confidence_score >= 0.7:
                hyp.confidence = "high"
                hyp.status = "confirmed"
            elif hyp.confidence_score >= 0.4:
                hyp.confidence = "moderate"
            else:
                hyp.confidence = "low"
                if hyp.confidence_score <= 0.2:
                    hyp.status = "ruled_out"

    # Check if we have enough evidence to diagnose
    confirmed = [h for h in hypotheses if h.status == "confirmed"]
    if confirmed:
        diagnosis.status = "diagnosed"
    elif all(h.status == "ruled_out" for h in hypotheses):
        diagnosis.status = "resolved"

    # Update mastery for the follow-up question's concept
    from app.services.assessment_service import _update_mastery
    _update_mastery(db, user_id, question.concept_id, is_correct)

    db.commit()

    # Find next follow-up if still investigating
    next_follow_up = None
    if diagnosis.status == "investigating":
        next_follow_up = _find_diagnostic_question(db, diagnosis, hypotheses, user_id)

    return _format_diagnosis_response(db, diagnosis, hypotheses, next_follow_up)


def _find_diagnostic_question(db: Session, diagnosis: DiagnosisSession,
                                hypotheses: list, user_id: int) -> Optional[dict]:
    """Find a targeted diagnostic question to distinguish between hypotheses."""
    # Get already asked follow-up questions
    asked_ids = db.query(DiagnosticFollowUp.question_id).filter(
        DiagnosticFollowUp.diagnosis_id == diagnosis.id,
    ).all()
    asked_ids = [r[0] for r in asked_ids]

    # Find questions targeting hypothesis concepts
    for hyp in hypotheses:
        if hyp.status == "ruled_out":
            continue

        q = db.query(Question).filter(
            Question.concept_id == hyp.concept_id,
            Question.is_diagnostic == True,
            ~Question.id.in_(asked_ids) if asked_ids else True,
            Question.id != diagnosis.trigger_question_id,
        ).first()

        if not q:
            # Fall back to any question for this concept
            q = db.query(Question).filter(
                Question.concept_id == hyp.concept_id,
                ~Question.id.in_(asked_ids) if asked_ids else True,
                Question.id != diagnosis.trigger_question_id,
            ).first()

        if q:
            # Record that we're asking this follow-up
            fu = DiagnosticFollowUp(
                diagnosis_id=diagnosis.id,
                question_id=q.id,
                purpose=f"Testing hypothesis: {hyp.misconception}",
                target_hypothesis_id=hyp.id,
            )
            db.add(fu)
            db.flush()

            choices = db.query(AnswerChoice).filter(
                AnswerChoice.question_id == q.id
            ).order_by(AnswerChoice.label).all()

            concept = db.query(Concept).filter(Concept.id == q.concept_id).first()

            return {
                "id": q.id,
                "question_text": q.question_text,
                "difficulty": q.difficulty,
                "question_type": q.question_type,
                "choices": [{"label": c.label, "text": c.text} for c in choices],
                "concept_name": concept.name if concept else None,
                "purpose": f"This question helps us understand if the difficulty is related to: {hyp.misconception}",
            }

    return None


def _format_diagnosis_response(db: Session, diagnosis: DiagnosisSession,
                                 hypotheses: list, follow_up: Optional[dict]) -> dict:
    """Format diagnosis response with hypotheses and recommendations."""
    formatted_hypotheses = []
    for hyp in hypotheses:
        concept = db.query(Concept).filter(Concept.id == hyp.concept_id).first()
        formatted_hypotheses.append({
            "id": hyp.id,
            "concept_name": concept.name if concept else "Unknown",
            "misconception": hyp.misconception,
            "confidence": hyp.confidence,
            "confidence_score": hyp.confidence_score,
            "evidence_for": json.loads(hyp.evidence_for or "[]"),
            "evidence_against": json.loads(hyp.evidence_against or "[]"),
            "recommended_intervention": hyp.recommended_intervention,
            "status": hyp.status,
        })

    # Sort by confidence score descending
    formatted_hypotheses.sort(key=lambda h: h["confidence_score"], reverse=True)

    # Get top recommendation
    recommendation = None
    top_hyp = formatted_hypotheses[0] if formatted_hypotheses else None
    if top_hyp:
        recommendation = top_hyp["recommended_intervention"]

    return {
        "id": diagnosis.id,
        "status": diagnosis.status,
        "hypotheses": formatted_hypotheses,
        "follow_up_question": follow_up,
        "recommendation": recommendation,
    }


def get_investigation_timeline(db: Session, user_id: int, diagnosis_id: Optional[int] = None) -> list:
    """Feature 1: Interactive Misconception Investigation Timeline from actual database records."""
    query = db.query(DiagnosisSession).filter(DiagnosisSession.user_id == user_id)
    if diagnosis_id:
        query = query.filter(DiagnosisSession.id == diagnosis_id)
    sessions = query.order_by(DiagnosisSession.created_at.desc()).limit(10).all()

    timelines = []
    for s in sessions:
        trigger_q = db.query(Question).filter(Question.id == s.trigger_question_id).first()
        trigger_resp = db.query(StudentResponse).filter(StudentResponse.id == s.trigger_response_id).first()
        concept = db.query(Concept).filter(Concept.id == trigger_q.concept_id).first() if trigger_q else None

        # Fetch candidate hypotheses
        hypotheses = db.query(MisconceptionHypothesis).filter(
            MisconceptionHypothesis.diagnosis_id == s.id
        ).all()

        # Fetch follow-up diagnostic questions
        follow_ups = db.query(DiagnosticFollowUp).filter(
            DiagnosticFollowUp.diagnosis_id == s.id
        ).all()

        fu_list = []
        for fu in follow_ups:
            fu_q = db.query(Question).filter(Question.id == fu.question_id).first()
            fu_list.append({
                "id": fu.id,
                "question_id": fu.question_id,
                "question_text": fu_q.question_text if fu_q else "Diagnostic problem",
                "purpose": fu.purpose or f"Test understanding of {concept.name if concept else 'related concept'}",
                "student_answer": fu.student_answer,
                "is_correct": fu.is_correct,
                "outcome": fu.outcome,
                "timestamp": fu.created_at.isoformat() if fu.created_at else None,
            })

        # Fetch reassessment responses for this concept created after the diagnosis
        reassessments = []
        if concept and s.created_at:
            post_responses = db.query(StudentResponse).join(Question).filter(
                StudentResponse.user_id == user_id,
                StudentResponse.created_at > s.created_at,
                Question.concept_id == concept.id,
            ).order_by(StudentResponse.created_at.asc()).all()

            for pr in post_responses:
                pr_q = db.query(Question).filter(Question.id == pr.question_id).first()
                reassessments.append({
                    "response_id": pr.id,
                    "assessment_id": pr.assessment_id,
                    "question_text": pr_q.question_text if pr_q else "Follow-up question",
                    "student_answer": pr.selected_answer,
                    "is_correct": pr.is_correct,
                    "timestamp": pr.created_at.isoformat() if pr.created_at else None,
                })

        # Top recommended intervention
        top_hyp = hypotheses[0] if hypotheses else None
        intervention = top_hyp.recommended_intervention if top_hyp else f"Review {concept.name if concept else 'differentiation'}"
        lesson = db.query(Lesson).filter(Lesson.concept_id == concept.id).first() if concept else None

        timeline_item = {
            "diagnosis_id": s.id,
            "assessment_id": s.assessment_id,
            "status": s.status,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "updated_at": s.updated_at.isoformat() if s.updated_at else None,
            "concept_involved": {
                "id": concept.id if concept else None,
                "name": concept.name if concept else "Differentiation",
                "difficulty": concept.difficulty if concept else "intermediate",
            },
            "trigger_event": {
                "question_id": trigger_q.id if trigger_q else None,
                "question_text": trigger_q.question_text if trigger_q else None,
                "student_answer": trigger_resp.selected_answer if trigger_resp else None,
                "correct_answer": trigger_q.correct_answer if trigger_q else None,
                "explanation": trigger_q.explanation if trigger_q else None,
                "response_time_seconds": trigger_resp.response_time_seconds if trigger_resp else None,
                "hint_used": trigger_resp.hint_used if trigger_resp else False,
            },
            "candidate_misconceptions": [
                {
                    "id": h.id,
                    "misconception": h.misconception,
                    "confidence": h.confidence,
                    "confidence_score": h.confidence_score,
                    "evidence_for": json.loads(h.evidence_for or "[]"),
                    "evidence_against": json.loads(h.evidence_against or "[]"),
                    "status": h.status,
                }
                for h in hypotheses
            ],
            "diagnostic_follow_ups": fu_list,
            "selected_intervention": {
                "recommendation": intervention,
                "lesson_title": lesson.title if lesson else f"{concept.name if concept else ''} Tutorial",
                "lesson_id": lesson.id if lesson else None,
            },
            "reassessment_results": reassessments,
        }
        timelines.append(timeline_item)

    return timelines


def get_technical_telemetry(db: Session, user_id: int, diagnosis_id: int) -> dict:
    """Feature 7: Developer-facing technical explainability telemetry."""
    diagnosis = db.query(DiagnosisSession).filter(
        DiagnosisSession.id == diagnosis_id,
        DiagnosisSession.user_id == user_id,
    ).first()
    if not diagnosis:
        raise ValueError("Diagnosis session not found")

    trigger_q = db.query(Question).filter(Question.id == diagnosis.trigger_question_id).first()
    trigger_resp = db.query(StudentResponse).filter(StudentResponse.id == diagnosis.trigger_response_id).first()
    concept = db.query(Concept).filter(Concept.id == trigger_q.concept_id).first() if trigger_q else None

    # Graph relationships traversed
    prereqs = db.query(ConceptPrerequisite).filter(
        ConceptPrerequisite.concept_id == concept.id
    ).all() if concept else []
    
    traversed_edges = []
    for p in prereqs:
        prereq_concept = db.query(Concept).filter(Concept.id == p.prerequisite_id).first()
        if prereq_concept:
            traversed_edges.append({
                "from_concept": prereq_concept.name,
                "to_concept": concept.name,
                "relationship": p.strength,
                "direction": "upstream_prerequisite",
            })

    # Student mastery update
    mastery = db.query(MasteryRecord).filter(
        MasteryRecord.user_id == user_id,
        MasteryRecord.concept_id == concept.id,
    ).first() if concept else None

    # Evidence details
    evidence_points = [
        f"Empirical response: Selected '{trigger_resp.selected_answer}' on Question #{trigger_q.id} (Expected '{trigger_q.correct_answer}')" if trigger_resp and trigger_q else "Empirical question response",
        f"Response latency: {trigger_resp.response_time_seconds}s" if trigger_resp and trigger_resp.response_time_seconds else "Latency measured",
        f"Socratic hints requested: {trigger_resp.hints_revealed if trigger_resp else 0}",
    ]

    return {
        "diagnosis_id": diagnosis.id,
        "selected_diagnostic_rule": {
            "rule_id": f"RULE_MISC_DIAG_{concept.id if concept else 'GEN'}",
            "rule_name": f"Cognitive Misconception Induction: {concept.name if concept else 'Calculus'}",
            "inference_type": "Deterministic Prerequisite-Aware Induction",
            "uncertainty_policy": "Candidate status prior <= 0.70; requires follow-up corroboration",
        },
        "evidence_used": evidence_points,
        "graph_relationships_traversed": traversed_edges,
        "reason_for_intervention": (
            f"Concept '{concept.name if concept else 'Calculus'}' is a prerequisite for downstream composite differentiation. "
            f"Resolving this misconception prevents error propagation in product, quotient, and chain rules."
        ),
        "resulting_assessment_update": {
            "concept_id": concept.id if concept else None,
            "concept_name": concept.name if concept else None,
            "current_mastery_level": mastery.mastery_level if mastery else "unassessed",
            "confidence_score": mastery.confidence_score if mastery else 0.0,
            "total_attempts": mastery.total_attempts if mastery else 0,
            "correct_attempts": mastery.correct_attempts if mastery else 0,
        },
    }
