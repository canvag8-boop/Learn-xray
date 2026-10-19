from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.concept import Concept
from app.models.learning import TutorSession, TutorMessage, LearningEvent
from app.schemas.dashboard import TutorSessionCreate, TutorMessageRequest
from app.services.ai_service import ai_service

router = APIRouter(prefix="/api/tutor", tags=["AI Tutor"])


@router.post("/sessions")
def create_tutor_session(data: TutorSessionCreate,
                         user: User = Depends(get_current_user),
                         db: Session = Depends(get_db)):
    """Create a new AI tutor chat session."""
    concept = None
    if data.concept_id:
        concept = db.query(Concept).filter(Concept.id == data.concept_id).first()
        if not concept:
            raise HTTPException(status_code=404, detail="Concept not found")

    session = TutorSession(
        user_id=user.id,
        concept_id=data.concept_id,
        mode=data.mode or "beginner",
        status="active",
    )
    db.add(session)
    db.flush()

    concept_name = concept.name if concept else "Differentiation"
    welcome_text = (
        f"Hi! I'm your LearnX-Ray AI Tutor. We're currently exploring **{concept_name}** "
        f"in **{data.mode.replace('_', ' ').title()}** mode.\n\n"
        "Ask me to explain any concept, guide you through a problem step-by-step, or test your understanding!"
    )

    welcome_msg = TutorMessage(
        session_id=session.id,
        role="assistant",
        content=welcome_text,
    )
    db.add(welcome_msg)

    db.add(LearningEvent(
        user_id=user.id,
        event_type="tutor_session_started",
        entity_type="tutor_session",
        entity_id=session.id,
    ))

    db.commit()

    return {
        "id": session.id,
        "concept_name": concept_name,
        "mode": session.mode,
        "status": session.status,
        "messages": [
            {
                "role": welcome_msg.role,
                "content": welcome_msg.content,
                "created_at": welcome_msg.created_at,
            }
        ],
    }


@router.get("/sessions")
def list_tutor_sessions(user: User = Depends(get_current_user),
                        db: Session = Depends(get_db)):
    """List recent tutor sessions for the user."""
    sessions = db.query(TutorSession).filter(
        TutorSession.user_id == user.id,
    ).order_by(TutorSession.updated_at.desc()).limit(10).all()

    result = []
    for s in sessions:
        concept = db.query(Concept).filter(Concept.id == s.concept_id).first() if s.concept_id else None
        msg_count = db.query(TutorMessage).filter(TutorMessage.session_id == s.id).count()
        result.append({
            "id": s.id,
            "concept_name": concept.name if concept else "General Differentiation",
            "mode": s.mode,
            "status": s.status,
            "message_count": msg_count,
            "created_at": s.created_at,
            "updated_at": s.updated_at,
        })
    return result


@router.get("/sessions/{session_id}")
def get_tutor_session(session_id: int,
                      user: User = Depends(get_current_user),
                      db: Session = Depends(get_db)):
    """Get tutor session messages and context."""
    session = db.query(TutorSession).filter(
        TutorSession.id == session_id,
        TutorSession.user_id == user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Tutor session not found")

    concept = db.query(Concept).filter(Concept.id == session.concept_id).first() if session.concept_id else None
    messages = db.query(TutorMessage).filter(
        TutorMessage.session_id == session.id,
    ).order_by(TutorMessage.created_at.asc()).all()

    return {
        "id": session.id,
        "concept_name": concept.name if concept else "Differentiation",
        "mode": session.mode,
        "status": session.status,
        "messages": [
            {
                "role": m.role,
                "content": m.content,
                "created_at": m.created_at,
            }
            for m in messages
        ],
    }


@router.post("/sessions/{session_id}/messages")
def send_tutor_message(session_id: int,
                       data: TutorMessageRequest,
                       user: User = Depends(get_current_user),
                       db: Session = Depends(get_db)):
    """Send a user message to the tutor and receive an AI or fallback response."""
    session = db.query(TutorSession).filter(
        TutorSession.id == session_id,
        TutorSession.user_id == user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Tutor session not found")

    # Record user message
    user_msg = TutorMessage(
        session_id=session.id,
        role="user",
        content=data.content.strip(),
    )
    db.add(user_msg)
    db.flush()

    # Get conversation history
    history = db.query(TutorMessage).filter(
        TutorMessage.session_id == session.id,
    ).order_by(TutorMessage.created_at.asc()).all()

    formatted_msgs = [{"role": m.role, "content": m.content} for m in history]

    concept = db.query(Concept).filter(Concept.id == session.concept_id).first() if session.concept_id else None
    concept_name = concept.name if concept else None

    # Get response from AI service
    response_content = ai_service.tutor_respond(
        messages=formatted_msgs,
        concept_name=concept_name,
        mode=session.mode,
    )

    assistant_msg = TutorMessage(
        session_id=session.id,
        role="assistant",
        content=response_content,
    )
    db.add(assistant_msg)
    db.commit()

    return {
        "user_message": {
            "role": user_msg.role,
            "content": user_msg.content,
            "created_at": user_msg.created_at,
        },
        "assistant_message": {
            "role": assistant_msg.role,
            "content": assistant_msg.content,
            "created_at": assistant_msg.created_at,
        },
    }
