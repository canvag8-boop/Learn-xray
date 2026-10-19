from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float, Boolean, func

from app.core.database import Base


class AssessmentSession(Base):
    __tablename__ = "assessment_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False, index=True)
    session_type = Column(String(50), default="diagnostic")  # diagnostic, practice, follow_up
    status = Column(String(50), default="in_progress")  # in_progress, completed, abandoned
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    accuracy = Column(Float, default=0.0)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    parent_session_id = Column(Integer, ForeignKey("assessment_sessions.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class StudentResponse(Base):
    __tablename__ = "student_responses"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessment_sessions.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False, index=True)
    selected_answer = Column(String(500), nullable=False)
    is_correct = Column(Boolean, nullable=False)
    response_time_seconds = Column(Float)
    hint_used = Column(Boolean, default=False)
    hints_revealed = Column(Integer, default=0)
    question_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class MasteryRecord(Base):
    """Tracks a student's mastery level for each concept over time."""
    __tablename__ = "mastery_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=False, index=True)
    mastery_level = Column(String(30), default="unassessed")  # unassessed, needs_practice, developing, mastered
    confidence_score = Column(Float, default=0.0)  # 0.0 to 1.0
    total_attempts = Column(Integer, default=0)
    correct_attempts = Column(Integer, default=0)
    last_assessed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
