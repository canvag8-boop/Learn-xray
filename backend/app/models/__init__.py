# Import all models so they're registered with SQLAlchemy Base
from app.models.user import User
from app.models.concept import Subject, Topic, Concept, ConceptPrerequisite
from app.models.question import Question, AnswerChoice
from app.models.assessment import AssessmentSession, StudentResponse, MasteryRecord
from app.models.diagnosis import DiagnosisSession, MisconceptionHypothesis, DiagnosticFollowUp
from app.models.learning import Lesson, LearningRecommendation, TutorSession, TutorMessage, LearningEvent

__all__ = [
    "User",
    "Subject", "Topic", "Concept", "ConceptPrerequisite",
    "Question", "AnswerChoice",
    "AssessmentSession", "StudentResponse", "MasteryRecord",
    "DiagnosisSession", "MisconceptionHypothesis", "DiagnosticFollowUp",
    "Lesson", "LearningRecommendation", "TutorSession", "TutorMessage", "LearningEvent",
]
