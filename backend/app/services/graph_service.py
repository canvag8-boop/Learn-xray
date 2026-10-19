"""
Graph service - manages the concept knowledge graph.
Uses PostgreSQL-backed tables by default, with the same interface
that a Neo4j implementation would expose.
"""
from typing import List, Dict, Optional
from sqlalchemy.orm import Session

from app.models.concept import Concept, ConceptPrerequisite, Topic
from app.models.assessment import MasteryRecord


def get_concept_graph(db: Session, user_id: int, topic_id: Optional[int] = None) -> dict:
    """Get the full concept graph with mastery status for a user."""
    query = db.query(Concept)
    if topic_id:
        query = query.filter(Concept.topic_id == topic_id)
    concepts = query.order_by(Concept.order_index).all()

    nodes = []
    for concept in concepts:
        mastery = db.query(MasteryRecord).filter(
            MasteryRecord.user_id == user_id,
            MasteryRecord.concept_id == concept.id,
        ).first()

        nodes.append({
            "id": concept.id,
            "name": concept.name,
            "difficulty": concept.difficulty,
            "mastery_level": mastery.mastery_level if mastery else "unassessed",
            "confidence_score": mastery.confidence_score if mastery else 0.0,
            "total_attempts": mastery.total_attempts if mastery else 0,
        })

    # Get edges
    concept_ids = [c.id for c in concepts]
    prereqs = db.query(ConceptPrerequisite).filter(
        ConceptPrerequisite.concept_id.in_(concept_ids),
    ).all()

    edges = [
        {"source": p.prerequisite_id, "target": p.concept_id, "strength": p.strength}
        for p in prereqs
    ]

    return {"nodes": nodes, "edges": edges}


def get_concept_details(db: Session, concept_id: int, user_id: int) -> Optional[dict]:
    """Get detailed concept info with mastery and prerequisites."""
    concept = db.query(Concept).filter(Concept.id == concept_id).first()
    if not concept:
        return None

    mastery = db.query(MasteryRecord).filter(
        MasteryRecord.user_id == user_id,
        MasteryRecord.concept_id == concept_id,
    ).first()

    # Get prerequisites
    prereqs = db.query(ConceptPrerequisite).filter(
        ConceptPrerequisite.concept_id == concept_id,
    ).all()
    prereq_names = []
    for p in prereqs:
        prereq = db.query(Concept).filter(Concept.id == p.prerequisite_id).first()
        if prereq:
            prereq_names.append(prereq.name)

    # Get dependents (concepts that require this one)
    dependents = db.query(ConceptPrerequisite).filter(
        ConceptPrerequisite.prerequisite_id == concept_id,
    ).all()
    dependent_names = []
    for d in dependents:
        dep = db.query(Concept).filter(Concept.id == d.concept_id).first()
        if dep:
            dependent_names.append(dep.name)

    import json
    from app.models.learning import Lesson
    from app.models.question import Question
    from app.models.assessment import StudentResponse

    # 1. Supporting Assessment Results
    recent_responses = db.query(StudentResponse).join(Question).filter(
        StudentResponse.user_id == user_id,
        Question.concept_id == concept_id,
    ).order_by(StudentResponse.created_at.desc()).limit(5).all()

    evidence_records = []
    for resp in recent_responses:
        q = db.query(Question).filter(Question.id == resp.question_id).first()
        evidence_records.append({
            "question_id": resp.question_id,
            "question_text": q.question_text if q else None,
            "selected_answer": resp.selected_answer,
            "is_correct": resp.is_correct,
            "timestamp": resp.created_at.isoformat() if resp.created_at else None,
        })

    # 2. Detailed Prerequisite Status & Bottleneck Analysis
    prereq_analysis = []
    has_unmet_prereq = False
    for p in prereqs:
        prereq_c = db.query(Concept).filter(Concept.id == p.prerequisite_id).first()
        if prereq_c:
            prereq_m = db.query(MasteryRecord).filter(
                MasteryRecord.user_id == user_id,
                MasteryRecord.concept_id == prereq_c.id,
            ).first()
            p_level = prereq_m.mastery_level if prereq_m else "unassessed"
            is_bottleneck = p_level in ("unassessed", "needs_practice")
            if is_bottleneck:
                has_unmet_prereq = True
            prereq_analysis.append({
                "concept_id": prereq_c.id,
                "name": prereq_c.name,
                "mastery_level": p_level,
                "is_bottleneck": is_bottleneck,
                "strength": p.strength,
            })

    # 3. Why Recommended
    current_level = mastery.mastery_level if mastery else "unassessed"
    attempts = mastery.total_attempts if mastery else 0
    correct = mastery.correct_attempts if mastery else 0
    accuracy_pct = round((correct / attempts * 100), 1) if attempts > 0 else 0.0

    if current_level == "unassessed":
        recommendation_reason = f"Concept has not been benchmarked yet. An initial diagnostic is recommended to evaluate your baseline."
    elif current_level == "needs_practice":
        if has_unmet_prereq:
            recommendation_reason = f"Accuracy is {accuracy_pct}% ({correct}/{attempts} correct). Upstream prerequisite gaps were detected that should be solidified first."
        else:
            recommendation_reason = f"Accuracy is {accuracy_pct}% ({correct}/{attempts} correct). Practice is recommended to build consistency."
    elif current_level == "developing":
        recommendation_reason = f"Steady progress at {accuracy_pct}% accuracy. Complete 1 more practice session to achieve full Mastered status."
    else:
        recommendation_reason = f"Mastered at {accuracy_pct}% accuracy. Ready for advanced competitive JEE differentiation problems."

    # 4. Recommended Lesson
    lesson = db.query(Lesson).filter(Lesson.concept_id == concept_id).first()
    recommended_lesson = {
        "id": lesson.id if lesson else None,
        "title": lesson.title if lesson else f"Mastering {concept.name}",
        "lesson_type": lesson.lesson_type if lesson else "interactive_tutorial",
    } if lesson else None

    # 5. How Improvement Will Be Verified
    verification_criteria = {
        "mastery_threshold": "Accuracy ≥ 80% with at least 3 verified problem attempts",
        "current_status": f"{correct}/{attempts} correct ({accuracy_pct}%)",
        "next_step": "Complete the 3-question adaptive checkpoint to confirm mastery and unlock dependent nodes."
    }

    return {
        "id": concept.id,
        "name": concept.name,
        "description": concept.description,
        "difficulty": concept.difficulty,
        "explanation": concept.explanation,
        "key_formulas": json.loads(concept.key_formulas) if concept.key_formulas else [],
        "common_mistakes": json.loads(concept.common_mistakes) if concept.common_mistakes else [],
        "mastery_level": current_level,
        "confidence_score": mastery.confidence_score if mastery else 0.0,
        "total_attempts": attempts,
        "correct_attempts": correct,
        "prerequisites": prereq_names,
        "unlocks": dependent_names,
        "recommendation_reason": recommendation_reason,
        "supporting_evidence": evidence_records,
        "prerequisite_analysis": prereq_analysis,
        "recommended_lesson": recommended_lesson,
        "verification_criteria": verification_criteria,
    }


def get_practice_questions(db: Session, concept_id: int, user_id: int, limit: int = 5) -> list:
    """Get practice questions for a concept, excluding recently answered ones."""
    from app.models.question import Question, AnswerChoice
    from app.models.assessment import StudentResponse

    # Get recently answered question IDs
    recent_ids = db.query(StudentResponse.question_id).filter(
        StudentResponse.user_id == user_id,
    ).order_by(StudentResponse.created_at.desc()).limit(20).all()
    recent_ids = [r[0] for r in recent_ids]

    # Get questions for this concept
    query = db.query(Question).filter(Question.concept_id == concept_id)
    if recent_ids:
        # Prefer unanswered questions but fall back to all
        unanswered = query.filter(~Question.id.in_(recent_ids)).limit(limit).all()
        if len(unanswered) >= limit:
            questions = unanswered
        else:
            questions = query.limit(limit).all()
    else:
        questions = query.limit(limit).all()

    result = []
    for q in questions:
        choices = db.query(AnswerChoice).filter(
            AnswerChoice.question_id == q.id
        ).order_by(AnswerChoice.label).all()

        result.append({
            "id": q.id,
            "question_text": q.question_text,
            "difficulty": q.difficulty,
            "question_type": q.question_type,
            "choices": [{"label": c.label, "text": c.text} for c in choices],
            "hint_1": q.hint_1,
            "hint_2": q.hint_2,
        })

    return result
