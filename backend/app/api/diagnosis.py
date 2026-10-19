from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.diagnosis import DiagnosisSession, MisconceptionHypothesis
from app.schemas.dashboard import DiagnosisRequest, FollowUpAnswer
from app.services import diagnosis_service

router = APIRouter(prefix="/api/diagnosis", tags=["Misconception Diagnosis"])


@router.post("/analyze")
def analyze_incorrect_answer(data: DiagnosisRequest,
                             user: User = Depends(get_current_user),
                             db: Session = Depends(get_db)):
    """Analyze an incorrect answer and initiate diagnostic hypothesis generation."""
    try:
        return diagnosis_service.analyze_incorrect_answer(
            db, user.id, data.assessment_id, data.response_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/timeline/all")
@router.get("/timeline")
def get_all_investigation_timelines(user: User = Depends(get_current_user),
                                    db: Session = Depends(get_db)):
    """Feature 1: Get all misconception investigation timelines for the student."""
    return diagnosis_service.get_investigation_timeline(db, user.id)


@router.get("/{diagnosis_id}")
def get_diagnosis(diagnosis_id: int,
                  user: User = Depends(get_current_user),
                  db: Session = Depends(get_db)):
    """Get the status, hypotheses, and pending follow-up questions for a diagnosis."""
    diagnosis = db.query(DiagnosisSession).filter(
        DiagnosisSession.id == diagnosis_id,
        DiagnosisSession.user_id == user.id,
    ).first()
    if not diagnosis:
        raise HTTPException(status_code=404, detail="Diagnosis session not found")

    hypotheses = db.query(MisconceptionHypothesis).filter(
        MisconceptionHypothesis.diagnosis_id == diagnosis_id,
    ).all()

    follow_up = None
    if diagnosis.status == "investigating":
        follow_up = diagnosis_service._find_diagnostic_question(db, diagnosis, hypotheses, user.id)

    return diagnosis_service._format_diagnosis_response(db, diagnosis, hypotheses, follow_up)


@router.post("/follow-up")
def answer_follow_up(data: FollowUpAnswer,
                     user: User = Depends(get_current_user),
                     db: Session = Depends(get_db)):
    """Submit an answer to a diagnostic follow-up question to refine hypotheses."""
    try:
        return diagnosis_service.answer_follow_up(
            db, user.id, data.diagnosis_id, data.question_id,
            data.selected_answer, data.response_time_seconds
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{diagnosis_id}/timeline")
def get_diagnosis_timeline(diagnosis_id: int,
                           user: User = Depends(get_current_user),
                           db: Session = Depends(get_db)):
    """Feature 1: Get interactive investigation timeline for a specific diagnosis session."""
    timelines = diagnosis_service.get_investigation_timeline(db, user.id, diagnosis_id)
    if not timelines:
        raise HTTPException(status_code=404, detail="Investigation timeline not found")
    return timelines[0]


@router.get("/{diagnosis_id}/telemetry")
def get_technical_telemetry(diagnosis_id: int,
                            user: User = Depends(get_current_user),
                            db: Session = Depends(get_db)):
    """Feature 7: Developer-facing diagnostic telemetry and inference explainability."""
    try:
        return diagnosis_service.get_technical_telemetry(db, user.id, diagnosis_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
