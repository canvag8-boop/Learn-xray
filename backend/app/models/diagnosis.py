from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float, Boolean, func

from app.core.database import Base


class DiagnosisSession(Base):
    """Tracks a misconception diagnosis workflow."""
    __tablename__ = "diagnosis_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    assessment_id = Column(Integer, ForeignKey("assessment_sessions.id"), nullable=False, index=True)
    trigger_question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    trigger_response_id = Column(Integer, ForeignKey("student_responses.id"), nullable=False)
    status = Column(String(50), default="investigating")  # investigating, diagnosed, resolved
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class MisconceptionHypothesis(Base):
    """A candidate misconception being investigated."""
    __tablename__ = "misconception_hypotheses"

    id = Column(Integer, primary_key=True, index=True)
    diagnosis_id = Column(Integer, ForeignKey("diagnosis_sessions.id"), nullable=False, index=True)
    concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=False, index=True)
    misconception = Column(Text, nullable=False)
    confidence = Column(String(20), default="low")  # low, moderate, high
    confidence_score = Column(Float, default=0.3)
    evidence_for = Column(Text)  # JSON list of evidence strings
    evidence_against = Column(Text)  # JSON list of evidence strings
    recommended_intervention = Column(Text)
    status = Column(String(30), default="candidate")  # candidate, confirmed, ruled_out
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class DiagnosticFollowUp(Base):
    """A targeted follow-up question to distinguish between candidate misconceptions."""
    __tablename__ = "diagnostic_follow_ups"

    id = Column(Integer, primary_key=True, index=True)
    diagnosis_id = Column(Integer, ForeignKey("diagnosis_sessions.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    purpose = Column(Text)  # Why this question was asked
    target_hypothesis_id = Column(Integer, ForeignKey("misconception_hypotheses.id"))
    student_answer = Column(String(500))
    is_correct = Column(Boolean, default=None)
    outcome = Column(Text)  # What the answer tells us
    created_at = Column(DateTime(timezone=True), server_default=func.now())


from sqlalchemy import Boolean
