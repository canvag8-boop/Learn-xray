export interface User {
  id: number;
  email: string;
  username: string;
  display_name: string;
  grade?: string;
  learning_goal?: string;
  is_demo: boolean;
  created_at?: string;
}

export interface QuestionChoice {
  label: string;
  text: string;
}

export interface Question {
  id: number;
  question_text: string;
  difficulty: string;
  question_type: string;
  choices: QuestionChoice[];
  hint_1?: string;
  hint_2?: string;
  hint_3?: string;
  concept_name?: string;
  purpose?: string;
  selection_reason?: string;
  rule_applied?: string;
  target_difficulty?: string;
}

export interface AnswerResult {
  response_id?: number;
  is_correct: boolean;
  correct_answer: string;
  explanation: string;
  misconception_tag?: string;
  concept_name: string;
}

export interface Assessment {
  id: number;
  topic_id: number;
  session_type: string;
  status: string;
  total_questions: number;
  correct_answers: number;
  accuracy: number;
  next_question?: Question;
}

export interface AssessmentSummary {
  assessment: Assessment;
  questions_answered: number;
  correct_count: number;
  accuracy: number;
  concepts_assessed: string[];
  weak_concepts: string[];
  strong_concepts: string[];
  recommendations: string[];
}

export interface GraphNode {
  id: number;
  name: string;
  difficulty: string;
  mastery_level: 'unassessed' | 'needs_practice' | 'developing' | 'mastered';
  confidence_score: number;
  total_attempts: number;
}

export interface GraphEdge {
  source: number;
  target: number;
  strength: string;
}

export interface ConceptGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ConceptDetails {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  explanation: string;
  key_formulas: string[];
  common_mistakes: string[];
  mastery_level: 'unassessed' | 'needs_practice' | 'developing' | 'mastered';
  confidence_score: number;
  total_attempts: number;
  correct_attempts: number;
  prerequisites: string[];
  unlocks: string[];
  recommendation_reason?: string;
  supporting_evidence?: {
    total_attempts: number;
    correct_attempts: number;
    accuracy_percentage: number;
    mastery_status: string;
    confidence_score: number;
    recent_responses: Array<{
      question_id: number;
      selected_answer: string;
      is_correct: boolean;
      created_at: string;
    }>;
  };
  prerequisite_analysis?: {
    prerequisites: Array<{
      name: string;
      mastery_level: string;
      status: string;
    }>;
    unmet_prerequisites: string[];
    is_ready_for_study: boolean;
  };
  recommended_lesson?: {
    id: number;
    title: string;
    difficulty: string;
    lesson_type: string;
    estimated_duration_display: string;
  } | null;
  verification_criteria?: {
    accuracy_threshold: string;
    minimum_practice_questions: number;
    follow_up_assessment_type: string;
  };
}

export interface Hypothesis {
  id: number;
  concept_name: string;
  misconception: string;
  confidence: 'low' | 'moderate' | 'high';
  confidence_score: number;
  evidence_for: string[];
  evidence_against: string[];
  recommended_intervention?: string;
  status: 'candidate' | 'investigating' | 'confirmed' | 'ruled_out';
}

export interface Diagnosis {
  id: number;
  status: 'investigating' | 'diagnosed' | 'resolved';
  hypotheses: Hypothesis[];
  follow_up_question?: Question;
  recommendation?: string;
}

export interface TutorMessage {
  role: 'user' | 'assistant' | 'system' | string;
  content: string;
  created_at?: string;
}

export interface TutorSession {
  id: number;
  concept_name?: string;
  mode: 'beginner' | 'exam_prep' | 'step_by_step' | 'hint_only' | 'practice';
  status: string;
  messages: TutorMessage[];
  message_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LearningRecommendation {
  id: number;
  concept_name: string;
  recommendation_type: 'lesson' | 'practice' | 'reassessment';
  reason: string;
  priority: number;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  lesson_title?: string;
}

export interface LearningPath {
  recommendations: LearningRecommendation[];
  weak_concepts: string[];
  next_action?: string;
}

export interface Lesson {
  id: number;
  title: string;
  content: string;
  difficulty: string;
  lesson_type: string;
}

export interface ConceptLessonData {
  concept_id: number;
  concept_name: string;
  description: string;
  explanation: string;
  key_formulas: string[];
  common_mistakes: string[];
  lessons: Lesson[];
}

export interface DashboardStats {
  questions_attempted: number;
  questions_correct: number;
  topics_assessed: number;
  concepts_needing_practice: number;
  mastered_concepts: number;
  developing_concepts: number;
  unassessed_concepts: number;
  accuracy_percentage: number;
}

export interface DashboardActivity {
  event_type: string;
  description: string;
  timestamp: string;
}

export interface DashboardData {
  user: User;
  stats: DashboardStats;
  recent_activity: DashboardActivity[];
  next_recommendation?: LearningRecommendation;
  mastery_overview: {
    mastered: number;
    developing: number;
    needs_practice: number;
    unassessed: number;
  };
}

export interface ProgressComparison {
  original_assessment?: {
    id: number;
    session_type: string;
    total_questions: number;
    correct_answers: number;
    accuracy: number;
    completed_at?: string;
  };
  follow_up_assessment?: {
    id: number;
    session_type: string;
    total_questions: number;
    correct_answers: number;
    accuracy: number;
    completed_at?: string;
  };
  accuracy_change?: number;
  concepts_improved: string[];
  concepts_still_weak: string[];
  total_questions_before: number;
  total_questions_after: number;
  recommendation: string;
  measured_evidence_badge?: string;
  empirical_provenance?: string;
}

export interface TimelineItem {
  id: number;
  trigger_question_id: number;
  trigger_question_text: string;
  original_selected_answer: string;
  concepts_involved: string[];
  candidate_misconceptions: Array<{
    misconception: string;
    confidence: string;
    confidence_score: number;
    status: string;
  }>;
  diagnostic_question: {
    id: number;
    question_text: string;
    purpose?: string;
    choices: QuestionChoice[];
  } | null;
  student_follow_up_response: {
    selected_answer: string;
    answered_at: string;
    is_consistent_with_hypothesis: boolean;
  } | null;
  selected_intervention: string | null;
  reassessment_result: {
    session_id: number;
    status: string;
    total_questions: number;
    correct_answers: number;
    accuracy: number;
  } | null;
  status: string;
  created_at: string;
}

export interface InvestigationTimelineResponse {
  timeline: TimelineItem[];
  total_investigations: number;
}

export interface TechnicalTelemetry {
  diagnosis_id: number;
  status: string;
  selected_diagnostic_rule: string;
  rule_description: string;
  evidence_used: Array<{
    type: string;
    value: any;
    weight: number;
  }>;
  graph_relationships_traversed: Array<{
    source: string;
    target: string;
    relation: string;
  }>;
  intervention_recommendation: {
    intervention: string;
    rationale: string;
  };
  assessment_updates: Array<{
    concept: string;
    previous_state: string;
    updated_state: string;
    confidence_delta: number;
  }>;
  engine_mode: string;
  timestamp: string;
}

export interface RecoveryPlanItem {
  concept_name: string;
  selection_reason: string;
  recommended_lesson: {
    id: number;
    title: string;
    lesson_type: string;
    estimated_duration_display: string;
  };
  practice_questions_count: number;
  estimated_duration_display: string;
  mastery_check: {
    criterion: string;
    verification_method: string;
  };
  next_recommended_action: string;
}

export interface RecoveryPlanResponse {
  recovery_plan: RecoveryPlanItem[];
  generated_at: string;
  data_provenance: string;
}

