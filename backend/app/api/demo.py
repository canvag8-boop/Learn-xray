from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.seed.seed_data import seed_all

router = APIRouter(prefix="/api/demo", tags=["Demo Mode"])


@router.post("/seed")
def seed_demo_data(db: Session = Depends(get_db)):
    """Seed sample data for demo evaluation."""
    if settings.ENVIRONMENT == "production":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Database seeding is disabled in production environments.",
        )
    seed_all(db)
    return {"message": "Demo data ready"}


@router.get("/status")
def demo_status(db: Session = Depends(get_db)):
    """Check if demo database is populated."""
    from app.models.concept import Concept
    from app.models.question import Question
    from app.models.user import User

    return {
        "concepts_count": db.query(Concept).count(),
        "questions_count": db.query(Question).count(),
        "demo_user_exists": db.query(User).filter(User.email == "demo@learnxray.com").first() is not None,
    }
