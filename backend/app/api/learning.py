from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.concept import Concept
from app.models.learning import Lesson
from app.services import learning_service

router = APIRouter(prefix="/api/learning", tags=["Learning Path & Lessons"])


@router.get("/path")
def get_learning_path(user: User = Depends(get_current_user),
                      db: Session = Depends(get_db)):
    """Generate or retrieve personalized learning recommendations."""
    return learning_service.generate_learning_path(db, user.id)


@router.get("/recovery-plan")
def get_recovery_plan(user: User = Depends(get_current_user),
                      db: Session = Depends(get_db)):
    """Feature 4: Structured Learning Recovery Plan with mastery checkpoints and estimated pacing."""
    return learning_service.generate_recovery_plan(db, user.id)


@router.post("/recommendations/{recommendation_id}/complete")
def complete_recommendation(recommendation_id: int,
                            user: User = Depends(get_current_user),
                            db: Session = Depends(get_db)):
    """Mark a learning recommendation as completed."""
    try:
        return learning_service.complete_recommendation(db, user.id, recommendation_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/lessons/{concept_id}")
def get_lesson(concept_id: int,
               user: User = Depends(get_current_user),
               db: Session = Depends(get_db)):
    """Get the lesson and worked examples for a concept."""
    concept = db.query(Concept).filter(Concept.id == concept_id).first()
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")

    lessons = db.query(Lesson).filter(Lesson.concept_id == concept_id).order_by(Lesson.order_index).all()

    import json
    return {
        "concept_id": concept.id,
        "concept_name": concept.name,
        "description": concept.description,
        "explanation": concept.explanation,
        "key_formulas": json.loads(concept.key_formulas) if concept.key_formulas else [],
        "common_mistakes": json.loads(concept.common_mistakes) if concept.common_mistakes else [],
        "lessons": [
            {
                "id": l.id,
                "title": l.title,
                "content": l.content,
                "difficulty": l.difficulty,
                "lesson_type": l.lesson_type,
            }
            for l in lessons
        ]
    }


@router.get("/comparison")
@router.get("/progress/comparison")
def get_progress_comparison(user: User = Depends(get_current_user),
                            db: Session = Depends(get_db)):
    """Compare performance across earlier and later assessments."""
    return learning_service.get_progress_comparison(db, user.id)
