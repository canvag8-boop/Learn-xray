from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.assessment import AssessmentSession, StudentResponse, MasteryRecord
from app.models.concept import Concept
from app.models.learning import LearningEvent, LearningRecommendation, Lesson
from app.schemas.dashboard import DashboardResponse, DashboardStats, DashboardActivity
from app.services.ai_service import ai_service
from datetime import datetime

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get the student dashboard with real statistics from stored records."""
    # Calculate stats from actual data
    total_attempted = db.query(StudentResponse).filter(
        StudentResponse.user_id == user.id
    ).count()

    total_correct = db.query(StudentResponse).filter(
        StudentResponse.user_id == user.id,
        StudentResponse.is_correct == True,
    ).count()

    topics_assessed = db.query(AssessmentSession.topic_id).filter(
        AssessmentSession.user_id == user.id,
        AssessmentSession.status == "completed",
    ).distinct().count()

    # Mastery overview from real records
    mastery_records = db.query(MasteryRecord).filter(
        MasteryRecord.user_id == user.id,
    ).all()

    mastered = sum(1 for m in mastery_records if m.mastery_level == "mastered")
    developing = sum(1 for m in mastery_records if m.mastery_level == "developing")
    needs_practice = sum(1 for m in mastery_records if m.mastery_level == "needs_practice")

    total_concepts = db.query(Concept).count()
    assessed_concept_ids = {m.concept_id for m in mastery_records}
    unassessed = total_concepts - len(assessed_concept_ids)

    stats = DashboardStats(
        questions_attempted=total_attempted,
        questions_correct=total_correct,
        topics_assessed=topics_assessed,
        concepts_needing_practice=needs_practice,
        mastered_concepts=mastered,
        developing_concepts=developing,
        unassessed_concepts=unassessed,
        accuracy_percentage=round((total_correct / total_attempted * 100) if total_attempted > 0 else 0, 1),
    )

    # Recent activity from learning events
    recent_events = db.query(LearningEvent).filter(
        LearningEvent.user_id == user.id,
    ).order_by(LearningEvent.created_at.desc()).limit(10).all()

    activity = []
    for event in recent_events:
        description = {
            "assessment_started": "Started a new assessment",
            "question_answered": "Answered a question",
            "diagnosis_started": "Started misconception diagnosis",
            "recommendation_completed": "Completed a learning recommendation",
            "tutor_session_started": "Started a tutor session",
        }.get(event.event_type, event.event_type)

        activity.append(DashboardActivity(
            event_type=event.event_type,
            description=description,
            timestamp=event.created_at,
        ))

    # Get next recommendation
    next_rec = db.query(LearningRecommendation).filter(
        LearningRecommendation.user_id == user.id,
        LearningRecommendation.status == "pending",
    ).order_by(LearningRecommendation.priority).first()

    next_recommendation = None
    if next_rec:
        concept = db.query(Concept).filter(Concept.id == next_rec.concept_id).first()
        lesson = db.query(Lesson).filter(Lesson.id == next_rec.lesson_id).first() if next_rec.lesson_id else None
        next_recommendation = {
            "id": next_rec.id,
            "concept_name": concept.name if concept else "Unknown",
            "recommendation_type": next_rec.recommendation_type,
            "reason": next_rec.reason,
            "priority": next_rec.priority,
            "status": next_rec.status,
            "lesson_title": lesson.title if lesson else None,
        }

    # Mastery overview for graph
    mastery_overview = {
        "mastered": mastered,
        "developing": developing,
        "needs_practice": needs_practice,
        "unassessed": unassessed,
        "total": total_concepts,
    }

    return DashboardResponse(
        user={
            "display_name": user.display_name,
            "learning_goal": user.learning_goal,
            "grade": user.grade,
            "is_demo": user.is_demo,
        },
        stats=stats,
        recent_activity=activity,
        next_recommendation=next_recommendation,
        mastery_overview=mastery_overview,
    )


@router.get("/activity")
def get_activity(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get detailed recent learning activity."""
    events = db.query(LearningEvent).filter(
        LearningEvent.user_id == user.id,
    ).order_by(LearningEvent.created_at.desc()).limit(20).all()

    return [
        {
            "id": e.id,
            "event_type": e.event_type,
            "entity_type": e.entity_type,
            "entity_id": e.entity_id,
            "created_at": e.created_at,
        }
        for e in events
    ]


@router.get("/ai-status")
def get_ai_status():
    """Check if AI provider is available."""
    return {
        "mode": ai_service.mode,
        "ai_available": ai_service.is_ai_available,
        "message": "AI tutor is fully active" if ai_service.is_ai_available else "Running in demo/fallback mode. Configure OPENAI_API_KEY for AI features.",
    }
