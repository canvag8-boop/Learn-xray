from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ConceptResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    difficulty: str
    explanation: Optional[str]
    key_formulas: Optional[str]
    common_mistakes: Optional[str]
    mastery_level: Optional[str] = "unassessed"
    confidence_score: Optional[float] = 0.0

    model_config = {"from_attributes": True}


class ConceptGraphNode(BaseModel):
    id: int
    name: str
    difficulty: str
    mastery_level: str = "unassessed"
    confidence_score: float = 0.0
    total_attempts: int = 0


class ConceptGraphEdge(BaseModel):
    source: int
    target: int
    strength: str = "required"


class ConceptGraphResponse(BaseModel):
    nodes: List[ConceptGraphNode]
    edges: List[ConceptGraphEdge]


class QuestionChoiceResponse(BaseModel):
    label: str
    text: str

    model_config = {"from_attributes": True}


class QuestionResponse(BaseModel):
    """Question sent to the client - NEVER includes correct_answer before submission."""
    id: int
    question_text: str
    difficulty: str
    question_type: str
    choices: List[QuestionChoiceResponse]
    hint_1: Optional[str] = None
    hint_2: Optional[str] = None
    hint_3: Optional[str] = None
    concept_name: Optional[str] = None

    model_config = {"from_attributes": True}


class AnswerSubmission(BaseModel):
    question_id: int
    selected_answer: str
    response_time_seconds: Optional[float] = None
    hint_used: bool = False
    hints_revealed: int = 0


class AnswerResult(BaseModel):
    is_correct: bool
    correct_answer: str
    explanation: str
    misconception_tag: Optional[str] = None
    concept_name: str


class AssessmentCreate(BaseModel):
    topic_id: Optional[int] = None
    session_type: str = "diagnostic"  # diagnostic, practice, follow_up
    parent_session_id: Optional[int] = None


class AssessmentResponse(BaseModel):
    id: int
    topic_id: int
    session_type: str
    status: str
    total_questions: int
    correct_answers: int
    accuracy: float
    started_at: Optional[datetime]
    completed_at: Optional[datetime]

    model_config = {"from_attributes": True}


class AssessmentSummary(BaseModel):
    assessment: AssessmentResponse
    questions_answered: int
    correct_count: int
    accuracy: float
    concepts_assessed: List[str]
    weak_concepts: List[str]
    strong_concepts: List[str]
    recommendations: List[str]
