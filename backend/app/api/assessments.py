from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.assessment import AssessmentCreate, AnswerSubmission
from app.services import assessment_service

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])


@router.post("")
def create_assessment(data: AssessmentCreate, user: User = Depends(get_current_user),
                       db: Session = Depends(get_db)):
    """Start a new assessment session."""
    try:
        session = assessment_service.create_assessment(
            db, user.id, data.topic_id, data.session_type, data.parent_session_id
        )
        return {
            "id": session.id,
            "topic_id": session.topic_id,
            "session_type": session.session_type,
            "status": session.status,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{assessment_id}")
def get_assessment(assessment_id: int, user: User = Depends(get_current_user),
                    db: Session = Depends(get_db)):
    """Get assessment details and the next question."""
    from app.models.assessment import AssessmentSession
    session = db.query(AssessmentSession).filter(
        AssessmentSession.id == assessment_id,
        AssessmentSession.user_id == user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Assessment not found")

    next_question = None
    if session.status == "in_progress":
        next_question = assessment_service.get_next_question(db, assessment_id, user.id)

    return {
        "id": session.id,
        "topic_id": session.topic_id,
        "session_type": session.session_type,
        "status": session.status,
        "total_questions": session.total_questions,
        "correct_answers": session.correct_answers,
        "accuracy": round(session.accuracy * 100, 1),
        "next_question": next_question,
    }


@router.post("/{assessment_id}/answers")
def submit_answer(assessment_id: int, data: AnswerSubmission,
                   user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Submit an answer for evaluation. Correct answer revealed only after submission."""
    try:
        result = assessment_service.submit_answer(
            db, assessment_id, user.id,
            data.question_id, data.selected_answer,
            data.response_time_seconds, data.hint_used, data.hints_revealed,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{assessment_id}/complete")
def complete_assessment(assessment_id: int, user: User = Depends(get_current_user),
                         db: Session = Depends(get_db)):
    """Complete an assessment and get the summary."""
    try:
        return assessment_service.complete_assessment(db, assessment_id, user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
