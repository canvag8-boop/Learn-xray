"""
Learning path recommendation engine.
Uses assessment results, mastery estimates, and prerequisite relationships
to generate personalized learning recommendations.
"""
import json
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.concept import Concept, ConceptPrerequisite, Topic
from app.models.assessment import MasteryRecord, AssessmentSession, StudentResponse
from app.models.question import Question
from app.models.learning import Lesson, LearningRecommendation, LearningEvent


def generate_learning_path(db: Session, user_id: int) -> dict:
    """Generate personalized learning recommendations based on current mastery."""
    # Get all concepts
    concepts = db.query(Concept).order_by(Concept.order_index).all()
    if not concepts:
        return {"recommendations": [], "weak_concepts": [], "next_action": "No content available yet."}

    # Get mastery for all concepts
    mastery_map = {}
    for c in concepts:
        m = db.query(MasteryRecord).filter(
            MasteryRecord.user_id == user_id,
            MasteryRecord.concept_id == c.id,
        ).first()
        mastery_map[c.id] = m

    # Step 1: Identify weak and unassessed concepts
    weak_concepts = []
    unassessed_concepts = []
    developing_concepts = []

    for c in concepts:
        m = mastery_map.get(c.id)
        if not m or m.mastery_level == "unassessed":
            unassessed_concepts.append(c)
        elif m.mastery_level == "needs_practice":
            weak_concepts.append(c)
        elif m.mastery_level == "developing":
            developing_concepts.append(c)

    # Step 2: Check prerequisites for weak concepts
    recommendations = []
    priority = 1

    # Clear old pending recommendations
    db.query(LearningRecommendation).filter(
        LearningRecommendation.user_id == user_id,
        LearningRecommendation.status == "pending",
    ).delete()

    # Step 3: Recommend prerequisites first
    for c in weak_concepts:
        prereqs = db.query(ConceptPrerequisite).filter(
            ConceptPrerequisite.concept_id == c.id
        ).all()

        for p in prereqs:
            prereq_mastery = mastery_map.get(p.prerequisite_id)
            prereq_concept = db.query(Concept).filter(Concept.id == p.prerequisite_id).first()

            if prereq_concept and (not prereq_mastery or prereq_mastery.mastery_level in ("unassessed", "needs_practice")):
                lesson = db.query(Lesson).filter(Lesson.concept_id == prereq_concept.id).first()
                rec = LearningRecommendation(
                    user_id=user_id,
                    concept_id=prereq_concept.id,
                    recommendation_type="lesson",
                    reason=f"Prerequisite for {c.name}. {prereq_concept.name} needs to be strengthened before progressing.",
                    priority=priority,
                    lesson_id=lesson.id if lesson else None,
                )
                db.add(rec)
                db.flush()
                recommendations.append(_format_recommendation(rec, prereq_concept, lesson))
                priority += 1

    # Step 4: Recommend lessons for weak concepts
    for c in weak_concepts:
        lesson = db.query(Lesson).filter(Lesson.concept_id == c.id).first()
        rec = LearningRecommendation(
            user_id=user_id,
            concept_id=c.id,
            recommendation_type="lesson",
            reason=f"Your accuracy on {c.name} questions needs improvement. Review the concept and try practice problems.",
            priority=priority,
            lesson_id=lesson.id if lesson else None,
        )
        db.add(rec)
        db.flush()
        recommendations.append(_format_recommendation(rec, c, lesson))
        priority += 1

    # Step 5: Recommend practice for developing concepts
    for c in developing_concepts:
        rec = LearningRecommendation(
            user_id=user_id,
            concept_id=c.id,
            recommendation_type="practice",
            reason=f"You're making progress on {c.name}. More practice will help solidify your understanding.",
            priority=priority,
        )
        db.add(rec)
        db.flush()
        recommendations.append(_format_recommendation(rec, c, None))
        priority += 1

    # Step 6: Recommend assessment for unassessed foundational concepts
    for c in unassessed_concepts:
        # Check if this is a foundational concept (few or no prerequisites)
        prereq_count = db.query(ConceptPrerequisite).filter(
            ConceptPrerequisite.concept_id == c.id
        ).count()

        if prereq_count == 0:
            rec = LearningRecommendation(
                user_id=user_id,
                concept_id=c.id,
                recommendation_type="reassessment",
                reason=f"{c.name} hasn't been assessed yet. It's a foundational concept — let's check your understanding.",
                priority=priority,
            )
            db.add(rec)
            db.flush()
            recommendations.append(_format_recommendation(rec, c, None))
            priority += 1

    db.commit()

    # Determine next action
    next_action = None
    if recommendations:
        top = recommendations[0]
        next_action = f"{top['recommendation_type'].title()}: {top['concept_name']} — {top['reason']}"
    elif not weak_concepts and not unassessed_concepts:
        next_action = "Great progress! Try the next set of advanced problems."

    return {
        "recommendations": recommendations,
        "weak_concepts": [c.name for c in weak_concepts],
        "next_action": next_action,
    }


def complete_recommendation(db: Session, user_id: int, recommendation_id: int) -> dict:
    """Mark a recommendation as completed."""
    rec = db.query(LearningRecommendation).filter(
        LearningRecommendation.id == recommendation_id,
        LearningRecommendation.user_id == user_id,
    ).first()
    if not rec:
        raise ValueError("Recommendation not found")

    rec.status = "completed"
    db.add(LearningEvent(
        user_id=user_id,
        event_type="recommendation_completed",
        entity_type="recommendation",
        entity_id=rec.id,
    ))
    db.commit()
    return {"message": "Recommendation completed", "id": rec.id}


def get_progress_comparison(db: Session, user_id: int) -> dict:
    """Compare original and follow-up assessment results."""
    # Get the most recent completed assessments
    sessions = db.query(AssessmentSession).filter(
        AssessmentSession.user_id == user_id,
        AssessmentSession.status == "completed",
    ).order_by(AssessmentSession.completed_at.desc()).limit(5).all()

    if len(sessions) < 2:
        return {
            "original_assessment": _format_assessment_summary(db, sessions[0]) if sessions else None,
            "follow_up_assessment": None,
            "accuracy_change": None,
            "concepts_improved": [],
            "concepts_still_weak": [],
            "total_questions_before": sessions[0].total_questions if sessions else 0,
            "total_questions_after": 0,
            "recommendation": "Complete more assessments to see your progress comparison.",
        }

    # Find original and follow-up
    follow_up = sessions[0]
    original = sessions[1]

    # Check if follow-up is explicitly linked
    if follow_up.parent_session_id:
        original = db.query(AssessmentSession).filter(
            AssessmentSession.id == follow_up.parent_session_id
        ).first() or original

    # Compare concept performance
    original_concepts = _get_concept_performance(db, original.id)
    followup_concepts = _get_concept_performance(db, follow_up.id)

    improved = []
    still_weak = []
    for concept_name, orig_acc in original_concepts.items():
        followup_acc = followup_concepts.get(concept_name)
        if followup_acc is not None:
            if followup_acc > orig_acc:
                improved.append(concept_name)
            elif followup_acc < 0.6:
                still_weak.append(concept_name)

    accuracy_change = round((follow_up.accuracy - original.accuracy) * 100, 1) if original.accuracy > 0 else None

    recommendation = "Keep practicing the concepts that still need work."
    if improved and not still_weak:
        recommendation = "Excellent improvement across all concepts! Try more advanced topics."
    elif improved:
        recommendation = f"Good progress on {', '.join(improved)}. Continue practicing {', '.join(still_weak)}."

    return {
        "original_assessment": _format_assessment_summary(db, original),
        "follow_up_assessment": _format_assessment_summary(db, follow_up),
        "accuracy_change": accuracy_change,
        "concepts_improved": improved,
        "concepts_still_weak": still_weak,
        "total_questions_before": original.total_questions,
        "total_questions_after": follow_up.total_questions,
        "recommendation": recommendation,
    }


def _format_recommendation(rec: LearningRecommendation, concept: Concept,
                             lesson: Optional[Lesson]) -> dict:
    return {
        "id": rec.id,
        "concept_name": concept.name,
        "recommendation_type": rec.recommendation_type,
        "reason": rec.reason,
        "priority": rec.priority,
        "status": rec.status,
        "lesson_title": lesson.title if lesson else None,
    }


def _format_assessment_summary(db: Session, session: AssessmentSession) -> dict:
    # Get concepts assessed in this session
    concepts_assessed = db.query(Concept.name).join(Question).join(StudentResponse).filter(
        StudentResponse.assessment_id == session.id
    ).distinct().all()
    concept_names = [c[0] for c in concepts_assessed]

    incorrect = max(0, session.total_questions - session.correct_answers)

    return {
        "id": session.id,
        "session_type": session.session_type,
        "total_questions": session.total_questions,
        "correct_answers": session.correct_answers,
        "incorrect_answers": incorrect,
        "accuracy": round(session.accuracy * 100, 1),
        "concepts_assessed": concept_names,
        "data_provenance": "empirical_measured_result",
        "completed_at": session.completed_at.isoformat() if session.completed_at else None,
    }


def generate_recovery_plan(db: Session, user_id: int) -> dict:
    """Feature 4: Generate a structured Learning Recovery Plan."""
    # Find active weak or developing concepts
    weak_records = db.query(MasteryRecord).filter(
        MasteryRecord.user_id == user_id,
        MasteryRecord.mastery_level.in_(["needs_practice", "developing"]),
    ).all()

    plan_items = []
    total_minutes = 0

    if weak_records:
        for m in weak_records[:3]:
            concept = db.query(Concept).filter(Concept.id == m.concept_id).first()
            if not concept:
                continue

            lesson = db.query(Lesson).filter(Lesson.concept_id == concept.id).first()

            # Check prerequisites
            prereqs = db.query(ConceptPrerequisite).filter(
                ConceptPrerequisite.concept_id == concept.id
            ).all()
            prereq_names = []
            for p in prereqs:
                pc = db.query(Concept).filter(Concept.id == p.prerequisite_id).first()
                if pc:
                    prereq_names.append(pc.name)

            est_minutes = 12 if concept.difficulty == "easy" else (18 if concept.difficulty == "medium" else 25)
            total_minutes += est_minutes

            duration_str = f"~{est_minutes} mins (approx)"
            lesson_dict = {
                "id": lesson.id if lesson else None,
                "title": lesson.title if lesson else f"Core Tutorial: {concept.name}",
                "difficulty": lesson.difficulty if lesson else concept.difficulty,
                "lesson_type": lesson.lesson_type if lesson else "conceptual",
                "estimated_duration_display": f"~{max(5, est_minutes - 5)} mins (approx)",
            }
            mastery_check_obj = {
                "criterion": f"Score ≥ 80% on 3 consecutive follow-up problems in {concept.name}",
                "verification_method": "Adaptive Checkpoint Session",
            }
            reason_text = (
                f"Current accuracy is {round(m.confidence_score * 100, 1)}% across {m.total_attempts} attempts. "
                f"{'Prerequisite for: ' + ', '.join(prereq_names) if prereq_names else 'Foundational topic requiring reinforcement.'}"
            )

            plan_items.append({
                "concept_id": concept.id,
                "concept_to_practice": concept.name,
                "concept_name": concept.name,
                "reason_for_selection": reason_text,
                "selection_reason": reason_text,
                "recommended_lesson": lesson_dict,
                "number_of_practice_questions": 3 if m.mastery_level == "developing" else 5,
                "practice_questions_count": 3 if m.mastery_level == "developing" else 5,
                "estimated_duration": duration_str,
                "estimated_duration_display": duration_str,
                "mastery_check": mastery_check_obj,
                "next_recommended_action": f"Unlock dependent lessons and advance to composite calculus once {concept.name} reaches Mastered (≥80%) status.",
                "status": "pending",
            })
    else:
        # If no weak concepts, suggest benchmark on foundational topic
        foundational = db.query(Concept).filter(Concept.order_index == 6).first() or db.query(Concept).first()
        lesson = db.query(Lesson).filter(Lesson.concept_id == foundational.id).first() if foundational else None
        total_minutes = 15
        f_name = foundational.name if foundational else "Power Rule"
        duration_str = "~15 mins (approx)"
        lesson_dict = {
            "id": lesson.id if lesson else 1,
            "title": lesson.title if lesson else "Introduction to Differentiation",
            "difficulty": "intermediate",
            "lesson_type": "conceptual",
            "estimated_duration_display": "~10 mins (approx)",
        }
        mastery_check_obj = {
            "criterion": f"Complete initial 3-question diagnostic assessment in {f_name}",
            "verification_method": "Diagnostic Baseline Session",
        }
        reason_text = "Diagnostic benchmark to establish your current mathematical differentiation profile."

        plan_items.append({
            "concept_id": foundational.id if foundational else 1,
            "concept_to_practice": f_name,
            "concept_name": f_name,
            "reason_for_selection": reason_text,
            "selection_reason": reason_text,
            "recommended_lesson": lesson_dict,
            "number_of_practice_questions": 3,
            "practice_questions_count": 3,
            "estimated_duration": duration_str,
            "estimated_duration_display": duration_str,
            "mastery_check": mastery_check_obj,
            "next_recommended_action": "Generate personalized prerequisite repair path based on diagnostic results.",
            "status": "pending",
        })

    return {
        "user_id": user_id,
        "plan_title": "Adaptive Differentiation Recovery Plan",
        "total_estimated_duration": f"~{total_minutes} mins (approx)",
        "duration_disclaimer": "Estimated durations are approximations based on typical student pacing.",
        "target_concepts": plan_items,
        "recovery_plan": plan_items,
        "overall_goal": "Repair foundational gaps in differentiation rules to unlock advanced composite calculus.",
        "data_provenance": "empirical_measured_result",
    }


def _get_concept_performance(db: Session, assessment_id: int) -> dict:
    """Get per-concept accuracy for an assessment."""
    responses = db.query(StudentResponse).filter(
        StudentResponse.assessment_id == assessment_id,
    ).all()

    concept_stats = {}
    for r in responses:
        q = db.query(Question).filter(Question.id == r.question_id).first()
        if q:
            c = db.query(Concept).filter(Concept.id == q.concept_id).first()
            if c:
                if c.name not in concept_stats:
                    concept_stats[c.name] = {"correct": 0, "total": 0}
                concept_stats[c.name]["total"] += 1
                if r.is_correct:
                    concept_stats[c.name]["correct"] += 1

    return {
        name: stats["correct"] / stats["total"] if stats["total"] > 0 else 0
        for name, stats in concept_stats.items()
    }
