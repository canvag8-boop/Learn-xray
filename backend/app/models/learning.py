from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, func

from app.core.database import Base


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=False, index=True)
    title = Column(String(300), nullable=False)
    content = Column(Text, nullable=False)
    difficulty = Column(String(20), default="intermediate")
    lesson_type = Column(String(50), default="explanation")  # explanation, worked_example, practice
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class LearningRecommendation(Base):
    __tablename__ = "learning_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=False, index=True)
    recommendation_type = Column(String(50), default="lesson")  # lesson, practice, reassessment
    reason = Column(Text, nullable=False)
    priority = Column(Integer, default=5)  # 1=highest, 10=lowest
    status = Column(String(30), default="pending")  # pending, in_progress, completed, dismissed
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class TutorSession(Base):
    __tablename__ = "tutor_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=True, index=True)
    mode = Column(String(50), default="beginner")  # beginner, exam_prep, step_by_step, hint_only, practice
    status = Column(String(30), default="active")  # active, ended
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class TutorMessage(Base):
    __tablename__ = "tutor_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("tutor_sessions.id"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class LearningEvent(Base):
    """General event log for all learning activities."""
    __tablename__ = "learning_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)  # assessment_started, question_answered, lesson_viewed, etc.
    entity_type = Column(String(50))  # assessment, question, concept, lesson
    entity_id = Column(Integer)
    metadata_json = Column(Text)  # Additional JSON metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
