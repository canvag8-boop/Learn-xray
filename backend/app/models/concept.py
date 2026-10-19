from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, func

from app.core.database import Base


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Concept(Base):
    __tablename__ = "concepts"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    difficulty = Column(String(20), default="intermediate")  # beginner, intermediate, advanced
    explanation = Column(Text)  # Curated explanation for fallback mode
    key_formulas = Column(Text)  # JSON string of key formulas
    common_mistakes = Column(Text)  # JSON string of common mistakes
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ConceptPrerequisite(Base):
    """Directed edge: concept requires prerequisite."""
    __tablename__ = "concept_prerequisites"

    id = Column(Integer, primary_key=True, index=True)
    concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=False, index=True)
    prerequisite_id = Column(Integer, ForeignKey("concepts.id"), nullable=False, index=True)
    strength = Column(String(20), default="required")  # required, recommended
    created_at = Column(DateTime(timezone=True), server_default=func.now())
