from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float, Boolean, func

from app.core.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False, index=True)
    concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), default="multiple_choice")  # multiple_choice, numeric, true_false
    difficulty = Column(String(20), default="medium")  # easy, medium, hard
    correct_answer = Column(String(500), nullable=False)  # Never sent to client before submission
    explanation = Column(Text, nullable=False)
    hint_1 = Column(Text)
    hint_2 = Column(Text)
    hint_3 = Column(Text)
    misconception_categories = Column(Text)  # JSON: list of misconception tags
    prerequisite_concepts = Column(Text)  # JSON: list of prerequisite concept IDs
    source = Column(String(200), default="curated")
    is_diagnostic = Column(Boolean, default=False)  # Used for follow-up diagnosis
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())



class AnswerChoice(Base):
    __tablename__ = "answer_choices"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False, index=True)
    label = Column(String(10), nullable=False)  # A, B, C, D
    text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)
    misconception_tag = Column(String(200))  # Which misconception selecting this answer suggests
    created_at = Column(DateTime(timezone=True), server_default=func.now())
