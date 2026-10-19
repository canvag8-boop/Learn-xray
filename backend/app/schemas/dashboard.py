from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class HypothesisResponse(BaseModel):
    id: int
    concept_name: str
    misconception: str
    confidence: str
    confidence_score: float
    evidence_for: Optional[List[str]] = None
    evidence_against: Optional[List[str]] = None
    recommended_intervention: Optional[str] = None
    status: str


class DiagnosisResponse(BaseModel):
    id: int
    status: str
    hypotheses: List[HypothesisResponse]
    follow_up_question: Optional[dict] = None
    recommendation: Optional[str] = None


class DiagnosisRequest(BaseModel):
    assessment_id: int
    response_id: int


class FollowUpAnswer(BaseModel):
    diagnosis_id: int
    question_id: int
    selected_answer: str
    response_time_seconds: Optional[float] = None


class TutorSessionCreate(BaseModel):
    concept_id: Optional[int] = None
    mode: str = "beginner"  # beginner, exam_prep, step_by_step, hint_only, practice


class TutorMessageRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)


class TutorMessageResponse(BaseModel):
    role: str
    content: str
    created_at: Optional[datetime] = None


class TutorSessionResponse(BaseModel):
    id: int
    concept_name: Optional[str] = None
    mode: str
    status: str
    messages: List[TutorMessageResponse]
    created_at: Optional[datetime] = None


class LearningRecommendationResponse(BaseModel):
    id: int
    concept_name: str
    recommendation_type: str
    reason: str
    priority: int
    status: str
    lesson_title: Optional[str] = None

    model_config = {"from_attributes": True}


class LearningPathResponse(BaseModel):
    recommendations: List[LearningRecommendationResponse]
    weak_concepts: List[str]
    next_action: Optional[str] = None


class DashboardStats(BaseModel):
    questions_attempted: int
    questions_correct: int
    topics_assessed: int
    concepts_needing_practice: int
    mastered_concepts: int
    developing_concepts: int
    unassessed_concepts: int
    accuracy_percentage: float


class DashboardActivity(BaseModel):
    event_type: str
    description: str
    timestamp: datetime


class DashboardResponse(BaseModel):
    user: dict
    stats: DashboardStats
    recent_activity: List[DashboardActivity]
    next_recommendation: Optional[LearningRecommendationResponse] = None
    mastery_overview: dict


class ProgressComparison(BaseModel):
    original_assessment: Optional[dict] = None
    follow_up_assessment: Optional[dict] = None
    accuracy_change: Optional[float] = None
    concepts_improved: List[str]
    concepts_still_weak: List[str]
    total_questions_before: int
    total_questions_after: int
    recommendation: str
