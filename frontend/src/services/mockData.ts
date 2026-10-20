/**
 * Static demo data that mirrors the real backend seed data.
 * Used in GitHub Pages (static hosting) where the FastAPI backend is unavailable.
 */

import {
  User, DashboardData, ConceptGraphData, ConceptDetails, Assessment,
  AssessmentSummary, AnswerResult, Diagnosis, TutorSession, LearningPath,
  ConceptLessonData, ProgressComparison, InvestigationTimelineResponse,
  TechnicalTelemetry, RecoveryPlanResponse,
} from '../types';

export const DEMO_USER: User = {
  id: 1,
  username: 'demo_student',
  email: 'demo@learnxray.com',
  display_name: 'Demo Student',
  grade: 'JEE Aspirant',
  learning_goal: 'Master Differentiation',
  is_demo: true,
  created_at: '2024-01-15T10:00:00Z',
};

export const DEMO_DASHBOARD: DashboardData = {
  user: DEMO_USER,
  stats: {
    questions_attempted: 24,
    questions_correct: 16,
    topics_assessed: 1,
    concepts_needing_practice: 3,
    mastered_concepts: 4,
    developing_concepts: 5,
    unassessed_concepts: 4,
    accuracy_percentage: 67,
  },
  mastery_overview: {
    mastered: 4,
    developing: 5,
    needs_practice: 3,
    unassessed: 4,
  },
  next_recommendation: {
    id: 1,
    concept_name: 'Chain Rule',
    recommendation_type: 'lesson',
    reason: 'Prerequisite gap detected: you struggled with Chain Rule applications. Mastering it will unlock Product Rule and Implicit Differentiation.',
    priority: 1,
    status: 'pending',
    lesson_title: 'Chain Rule — Step-by-Step Guide',
  },
  recent_activity: [
    { event_type: 'answer_correct', description: 'Correctly answered a Power Rule question (d/dx of x³)', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { event_type: 'answer_incorrect', description: 'Incorrect answer on Chain Rule composition (f(g(x)) derivative)', timestamp: new Date(Date.now() - 7200000).toISOString() },
    { event_type: 'misconception_flagged', description: 'Misconception flagged: Confusing Product Rule with Chain Rule', timestamp: new Date(Date.now() - 10800000).toISOString() },
    { event_type: 'answer_correct', description: 'Correctly identified d/dx(sin x) = cos x', timestamp: new Date(Date.now() - 14400000).toISOString() },
    { event_type: 'answer_correct', description: 'Correctly applied Quotient Rule to a rational function', timestamp: new Date(Date.now() - 18000000).toISOString() },
  ],
};

export const DEMO_CONCEPT_GRAPH: ConceptGraphData = {
  nodes: [
    { id: 1, name: 'Basic Algebra', difficulty: 'beginner', mastery_level: 'mastered', confidence_score: 0.91, total_attempts: 5 },
    { id: 2, name: 'Exponent Rules', difficulty: 'beginner', mastery_level: 'mastered', confidence_score: 0.85, total_attempts: 4 },
    { id: 3, name: 'Functions and Notation', difficulty: 'beginner', mastery_level: 'mastered', confidence_score: 0.88, total_attempts: 3 },
    { id: 4, name: 'Limits (Intuitive)', difficulty: 'intermediate', mastery_level: 'developing', confidence_score: 0.62, total_attempts: 4 },
    { id: 5, name: 'Definition of Derivative', difficulty: 'intermediate', mastery_level: 'developing', confidence_score: 0.58, total_attempts: 3 },
    { id: 6, name: 'Power Rule', difficulty: 'intermediate', mastery_level: 'mastered', confidence_score: 0.83, total_attempts: 6 },
    { id: 7, name: 'Chain Rule', difficulty: 'intermediate', mastery_level: 'needs_practice', confidence_score: 0.34, total_attempts: 4 },
    { id: 8, name: 'Product Rule', difficulty: 'intermediate', mastery_level: 'developing', confidence_score: 0.55, total_attempts: 3 },
    { id: 9, name: 'Quotient Rule', difficulty: 'intermediate', mastery_level: 'developing', confidence_score: 0.60, total_attempts: 2 },
    { id: 10, name: 'Trig Derivatives', difficulty: 'advanced', mastery_level: 'developing', confidence_score: 0.48, total_attempts: 3 },
    { id: 11, name: 'Implicit Differentiation', difficulty: 'advanced', mastery_level: 'needs_practice', confidence_score: 0.28, total_attempts: 2 },
    { id: 12, name: 'Related Rates', difficulty: 'advanced', mastery_level: 'needs_practice', confidence_score: 0.22, total_attempts: 1 },
    { id: 13, name: 'Higher Order Derivatives', difficulty: 'advanced', mastery_level: 'unassessed', confidence_score: 0.0, total_attempts: 0 },
    { id: 14, name: 'Exponential & Log Derivatives', difficulty: 'advanced', mastery_level: 'unassessed', confidence_score: 0.0, total_attempts: 0 },
    { id: 15, name: 'Applications of Derivatives', difficulty: 'advanced', mastery_level: 'unassessed', confidence_score: 0.0, total_attempts: 0 },
    { id: 16, name: 'L\'Hôpital\'s Rule', difficulty: 'advanced', mastery_level: 'unassessed', confidence_score: 0.0, total_attempts: 0 },
  ],
  edges: [
    { source: 1, target: 4, strength: 'strong' },
    { source: 2, target: 6, strength: 'strong' },
    { source: 3, target: 5, strength: 'strong' },
    { source: 4, target: 5, strength: 'strong' },
    { source: 5, target: 6, strength: 'moderate' },
    { source: 6, target: 7, strength: 'strong' },
    { source: 6, target: 8, strength: 'strong' },
    { source: 6, target: 9, strength: 'strong' },
    { source: 3, target: 10, strength: 'moderate' },
    { source: 7, target: 11, strength: 'strong' },
    { source: 8, target: 11, strength: 'moderate' },
    { source: 9, target: 11, strength: 'moderate' },
    { source: 11, target: 12, strength: 'strong' },
    { source: 6, target: 13, strength: 'moderate' },
    { source: 4, target: 14, strength: 'moderate' },
    { source: 7, target: 15, strength: 'moderate' },
    { source: 4, target: 16, strength: 'strong' },
  ],
};

const makeConceptDetail = (id: number, name: string, difficulty: string, mastery_level: any, confidence_score: number, total_attempts: number, correct_attempts: number, description: string, explanation: string, key_formulas: string[], common_mistakes: string[], prerequisites: string[], unlocks: string[]): ConceptDetails => ({
  id, name, difficulty, mastery_level, confidence_score, total_attempts, correct_attempts,
  description, explanation, key_formulas, common_mistakes, prerequisites, unlocks,
  supporting_evidence: {
    total_attempts, correct_attempts,
    accuracy_percentage: total_attempts > 0 ? Math.round((correct_attempts / total_attempts) * 100) : 0,
    mastery_status: mastery_level,
    confidence_score,
    recent_responses: [],
  },
  prerequisite_analysis: {
    prerequisites: prerequisites.map(p => ({ name: p, mastery_level: 'mastered', status: 'met' })),
    unmet_prerequisites: [],
    is_ready_for_study: true,
  },
  verification_criteria: {
    accuracy_threshold: '≥80% over 5 questions',
    minimum_practice_questions: 5,
    follow_up_assessment_type: 'targeted',
  },
});

export const DEMO_CONCEPTS: Record<number, ConceptDetails> = {
  7: makeConceptDetail(7, 'Chain Rule', 'intermediate', 'needs_practice', 0.34, 4, 1,
    'Rule for differentiating composite functions',
    'The Chain Rule: if y = f(g(x)), then dy/dx = f\'(g(x)) · g\'(x). Think of it as differentiating the outer function (leaving the inner function alone) multiplied by the derivative of the inner function.',
    ['d/dx[f(g(x))] = f\'(g(x)) · g\'(x)', 'd/dx[sin(x²)] = cos(x²) · 2x', 'd/dx[(3x+1)⁵] = 5(3x+1)⁴ · 3'],
    ['Forgetting to multiply by the inner derivative', 'Confusing with Product Rule', 'Not identifying the "inner" vs "outer" function'],
    ['Power Rule', 'Exponent Rules'],
    ['Implicit Differentiation', 'Related Rates']
  ),
  8: makeConceptDetail(8, 'Product Rule', 'intermediate', 'developing', 0.55, 3, 2,
    'Rule for differentiating products of two functions',
    'The Product Rule: if h(x) = f(x)·g(x), then h\'(x) = f\'(x)·g(x) + f(x)·g\'(x). Often remembered as "first times derivative of second plus second times derivative of first".',
    ['d/dx[f(x)g(x)] = f\'g + fg\'', 'd/dx[x²·sin(x)] = 2x·sin(x) + x²·cos(x)'],
    ['Thinking derivative of product equals product of derivatives', 'Forgetting one of the two terms', 'Sign errors when applying to negative functions'],
    ['Power Rule', 'Functions and Notation'],
    ['Implicit Differentiation', 'Applications of Derivatives']
  ),
  6: makeConceptDetail(6, 'Power Rule', 'intermediate', 'mastered', 0.83, 6, 5,
    'Derivative of x^n is n·x^(n-1)',
    'The power rule states: if f(x) = x^n, then f\'(x) = n·x^(n-1). Works for all real n including negatives and fractions.',
    ['d/dx(x^n) = n·x^(n-1)', 'd/dx(x³) = 3x²', 'd/dx(√x) = 1/(2√x)', 'd/dx(1/x) = -1/x²'],
    ['Forgetting to subtract 1 from exponent', 'Not seeing √x as x^(1/2)', 'Applying to e^x which needs its own rule'],
    ['Exponent Rules', 'Definition of Derivative'],
    ['Chain Rule', 'Product Rule', 'Quotient Rule']
  ),
};

const DEMO_QUESTIONS = [
  {
    id: 1, question_text: 'What is the derivative of f(x) = x⁵?',
    difficulty: 'beginner', question_type: 'mcq',
    choices: [
      { label: 'A', text: '5x⁴' },
      { label: 'B', text: '5x⁵' },
      { label: 'C', text: 'x⁴' },
      { label: 'D', text: '4x⁴' },
    ],
    concept_name: 'Power Rule',
    hint_1: 'Use the power rule: d/dx(xⁿ) = n·x^(n-1)',
    hint_2: 'Bring the exponent down and subtract 1',
    hint_3: 'Answer: 5 · x^(5-1) = 5x⁴',
  },
  {
    id: 2, question_text: 'Find the derivative of f(x) = sin(x³)',
    difficulty: 'intermediate', question_type: 'mcq',
    choices: [
      { label: 'A', text: 'cos(x³)' },
      { label: 'B', text: '3x² · cos(x³)' },
      { label: 'C', text: '3x² · sin(x³)' },
      { label: 'D', text: 'cos(3x²)' },
    ],
    concept_name: 'Chain Rule',
    hint_1: 'Identify the outer function (sin) and inner function (x³)',
    hint_2: 'Derivative of sin is cos; then multiply by derivative of inner function',
    hint_3: 'Chain Rule: d/dx[sin(x³)] = cos(x³) · 3x²',
  },
  {
    id: 3, question_text: 'Differentiate f(x) = x² · cos(x)',
    difficulty: 'intermediate', question_type: 'mcq',
    choices: [
      { label: 'A', text: '2x · cos(x)' },
      { label: 'B', text: '-x² · sin(x)' },
      { label: 'C', text: '2x · cos(x) - x² · sin(x)' },
      { label: 'D', text: '2x · cos(x) + x² · sin(x)' },
    ],
    concept_name: 'Product Rule',
    hint_1: 'This is a product of two functions: x² and cos(x)',
    hint_2: 'Product Rule: d/dx[fg] = f\'g + fg\'',
    hint_3: 'f=x², f\'=2x, g=cos(x), g\'=-sin(x). So: 2x·cos(x) + x²·(-sin(x))',
  },
  {
    id: 4, question_text: 'What is d/dx of (3x + 2)⁴?',
    difficulty: 'intermediate', question_type: 'mcq',
    choices: [
      { label: 'A', text: '4(3x+2)³' },
      { label: 'B', text: '12(3x+2)³' },
      { label: 'C', text: '4(3x+2)³ · 3' },
      { label: 'D', text: '(3x+2)³' },
    ],
    concept_name: 'Chain Rule',
    hint_1: 'The outer function is ( )⁴ and the inner function is 3x+2',
    hint_2: 'Power rule on outside: 4(3x+2)³, then multiply by derivative of inside',
    hint_3: 'd/dx(3x+2) = 3, so answer is 4(3x+2)³ · 3 = 12(3x+2)³',
  },
  {
    id: 5, question_text: 'Find f\'(x) if f(x) = x³/x² (simplify first)',
    difficulty: 'beginner', question_type: 'mcq',
    choices: [
      { label: 'A', text: '0' },
      { label: 'B', text: '1' },
      { label: 'C', text: '3x²' },
      { label: 'D', text: '3x/2' },
    ],
    concept_name: 'Exponent Rules',
    hint_1: 'Simplify x³/x² first using exponent rules',
    hint_2: 'x³/x² = x^(3-2) = x',
    hint_3: 'd/dx(x) = 1',
  },
];

let _assessmentId = 100;
let _assessmentQuestionIndex = 0;
let _assessmentCorrect = 0;

export function makeDemoAssessment(): Assessment {
  _assessmentId++;
  _assessmentQuestionIndex = 0;
  _assessmentCorrect = 0;
  return {
    id: _assessmentId,
    topic_id: 1,
    session_type: 'diagnostic',
    status: 'active',
    total_questions: DEMO_QUESTIONS.length,
    correct_answers: 0,
    accuracy: 0,
    next_question: DEMO_QUESTIONS[0] as any,
  };
}

export function submitDemoAnswer(assessmentId: number, questionId: number, selectedAnswer: string): { assessment: Assessment; result: AnswerResult } {
  const question = DEMO_QUESTIONS.find(q => q.id === questionId) || DEMO_QUESTIONS[0];
  const correctAnswers: Record<number, string> = { 1: 'A', 2: 'B', 3: 'C', 4: 'B', 5: 'B' };
  const explanations: Record<number, string> = {
    1: 'By Power Rule: d/dx(x⁵) = 5·x^(5-1) = 5x⁴',
    2: 'Chain Rule: outer function sin gives cos, inner function x³ gives 3x². Result: 3x²·cos(x³)',
    3: 'Product Rule: d/dx[x²·cos(x)] = 2x·cos(x) + x²·(-sin(x)) = 2x·cos(x) - x²·sin(x)',
    4: 'Chain Rule: 4·(3x+2)³ × d/dx(3x+2) = 4(3x+2)³ × 3 = 12(3x+2)³',
    5: 'Simplify first: x³/x² = x. Then d/dx(x) = 1.',
  };

  const correct = correctAnswers[questionId] || 'A';
  const isCorrect = selectedAnswer === correct;
  if (isCorrect) _assessmentCorrect++;
  _assessmentQuestionIndex++;

  const nextQuestion = _assessmentQuestionIndex < DEMO_QUESTIONS.length
    ? DEMO_QUESTIONS[_assessmentQuestionIndex] as any
    : undefined;

  return {
    result: {
      response_id: Math.floor(Math.random() * 1000),
      is_correct: isCorrect,
      correct_answer: correct,
      explanation: explanations[questionId] || 'The correct approach uses fundamental calculus rules.',
      misconception_tag: !isCorrect ? 'rule_confusion' : undefined,
      concept_name: question.concept_name || 'Calculus',
    },
    assessment: {
      id: assessmentId,
      topic_id: 1,
      session_type: 'diagnostic',
      status: nextQuestion ? 'active' : 'completed',
      total_questions: DEMO_QUESTIONS.length,
      correct_answers: _assessmentCorrect,
      accuracy: Math.round((_assessmentCorrect / _assessmentQuestionIndex) * 100),
      next_question: nextQuestion,
    },
  };
}

export function makeDemoAssessmentSummary(assessmentId: number): AssessmentSummary {
  return {
    assessment: {
      id: assessmentId, topic_id: 1, session_type: 'diagnostic', status: 'completed',
      total_questions: DEMO_QUESTIONS.length, correct_answers: _assessmentCorrect,
      accuracy: Math.round((_assessmentCorrect / Math.max(_assessmentQuestionIndex, 1)) * 100),
    },
    questions_answered: _assessmentQuestionIndex,
    correct_count: _assessmentCorrect,
    accuracy: Math.round((_assessmentCorrect / Math.max(_assessmentQuestionIndex, 1)) * 100),
    concepts_assessed: ['Power Rule', 'Chain Rule', 'Product Rule', 'Exponent Rules'],
    weak_concepts: _assessmentCorrect < 3 ? ['Chain Rule', 'Product Rule'] : ['Chain Rule'],
    strong_concepts: _assessmentCorrect >= 3 ? ['Power Rule', 'Exponent Rules'] : ['Exponent Rules'],
    recommendations: [
      'Review Chain Rule for composite functions',
      'Practice Product Rule with trigonometric functions',
      'Start with simpler compositions before attempting complex ones',
    ],
  };
}

export const DEMO_LEARNING_PATH: LearningPath = {
  recommendations: [
    { id: 1, concept_name: 'Chain Rule', recommendation_type: 'lesson', reason: 'Prerequisite gap: Chain Rule must be mastered before tackling Implicit Differentiation.', priority: 1, status: 'pending', lesson_title: 'Chain Rule — Step-by-Step' },
    { id: 2, concept_name: 'Product Rule', recommendation_type: 'practice', reason: 'You answered 67% correctly. Practice 3 more questions to reach mastery threshold.', priority: 2, status: 'pending', lesson_title: 'Product Rule Practice Set' },
    { id: 3, concept_name: 'Quotient Rule', recommendation_type: 'lesson', reason: 'Not yet assessed. Unlocks after Product Rule mastery.', priority: 3, status: 'pending', lesson_title: 'Quotient Rule Introduction' },
    { id: 4, concept_name: 'Trig Derivatives', recommendation_type: 'reassessment', reason: 'Reassess to confirm developing-level mastery.', priority: 4, status: 'pending' },
    { id: 5, concept_name: 'Implicit Differentiation', recommendation_type: 'lesson', reason: 'Requires Chain Rule mastery first.', priority: 5, status: 'pending', lesson_title: 'Implicit Differentiation — Guided Walkthrough' },
  ],
  weak_concepts: ['Chain Rule', 'Implicit Differentiation', 'Related Rates'],
  next_action: 'Start Chain Rule lesson to unblock 3 advanced topics',
};

export const DEMO_PROGRESS: ProgressComparison = {
  original_assessment: { id: 1, session_type: 'diagnostic', total_questions: 10, correct_answers: 5, accuracy: 50, completed_at: new Date(Date.now() - 604800000).toISOString() },
  follow_up_assessment: { id: 2, session_type: 'reassessment', total_questions: 10, correct_answers: 8, accuracy: 80, completed_at: new Date(Date.now() - 86400000).toISOString() },
  accuracy_change: 30,
  concepts_improved: ['Power Rule', 'Exponent Rules', 'Basic Algebra'],
  concepts_still_weak: ['Chain Rule', 'Implicit Differentiation'],
  total_questions_before: 10,
  total_questions_after: 10,
  recommendation: 'Great progress! You improved 30% on Power Rule topics. Focus next on Chain Rule to unlock advanced differentiation.',
  measured_evidence_badge: '📈 +30% Accuracy Improvement',
  empirical_provenance: 'Measured across 2 assessments (10 questions each)',
};

export const DEMO_TIMELINE: InvestigationTimelineResponse = {
  total_investigations: 2,
  timeline: [
    {
      id: 1,
      trigger_question_id: 2,
      trigger_question_text: 'Find the derivative of f(x) = sin(x³)',
      original_selected_answer: 'A',
      concepts_involved: ['Chain Rule', 'Trig Derivatives'],
      candidate_misconceptions: [
        { misconception: 'Forgetting inner derivative in Chain Rule', confidence: 'high', confidence_score: 0.82, status: 'confirmed' },
        { misconception: 'Confusing composite vs simple differentiation', confidence: 'moderate', confidence_score: 0.54, status: 'ruled_out' },
      ],
      diagnostic_question: {
        id: 101,
        question_text: 'What is d/dx of (x²)?',
        purpose: 'Verify basic Power Rule understanding as prerequisite',
        choices: [{ label: 'A', text: '2x' }, { label: 'B', text: 'x' }, { label: 'C', text: '2' }, { label: 'D', text: 'x²' }],
      },
      student_follow_up_response: { selected_answer: 'A', answered_at: new Date(Date.now() - 7200000).toISOString(), is_consistent_with_hypothesis: true },
      selected_intervention: 'Chain Rule practice set with step-by-step worked examples',
      reassessment_result: { session_id: 2, status: 'completed', total_questions: 3, correct_answers: 2, accuracy: 67 },
      status: 'resolved',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 2,
      trigger_question_id: 3,
      trigger_question_text: 'Differentiate f(x) = x² · cos(x)',
      original_selected_answer: 'D',
      concepts_involved: ['Product Rule'],
      candidate_misconceptions: [
        { misconception: 'Sign error when differentiating cos(x)', confidence: 'moderate', confidence_score: 0.65, status: 'investigating' },
      ],
      diagnostic_question: {
        id: 102,
        question_text: 'What is d/dx of cos(x)?',
        purpose: 'Check if student knows d/dx[cos] = -sin',
        choices: [{ label: 'A', text: '-sin(x)' }, { label: 'B', text: 'sin(x)' }, { label: 'C', text: '-cos(x)' }, { label: 'D', text: 'tan(x)' }],
      },
      student_follow_up_response: null,
      selected_intervention: null,
      reassessment_result: null,
      status: 'investigating',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
};

export const DEMO_TUTOR_SESSION: TutorSession = {
  id: 1,
  concept_name: 'Chain Rule',
  mode: 'beginner',
  status: 'active',
  messages: [
    { role: 'assistant', content: '👋 Hi! I\'m your AI Tutor. I\'m here to help you master the Chain Rule.\n\nThe Chain Rule is used when differentiating **composite functions** — functions inside other functions.\n\n**The formula:** If y = f(g(x)), then:\n$$\\frac{dy}{dx} = f\'(g(x)) \\cdot g\'(x)$$\n\nSimply: *"Derivative of outside × derivative of inside"*\n\nWould you like to start with a simple example, or do you have a specific question?', created_at: new Date(Date.now() - 300000).toISOString() },
  ],
  message_count: 1,
  created_at: new Date(Date.now() - 300000).toISOString(),
};

export function getDemoTutorReply(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  if (msg.includes('chain rule') || msg.includes('example')) {
    return '**Chain Rule Example:**\n\nLet\'s find d/dx of sin(x²).\n\n1. **Outer function:** sin(\_) → derivative is cos(\_)\n2. **Inner function:** x² → derivative is 2x\n3. **Apply Chain Rule:** cos(x²) × 2x = **2x·cos(x²)**\n\nTry this: What is d/dx of (3x + 1)⁵? Think about what the outer and inner functions are! 🎯';
  }
  if (msg.includes('product rule')) {
    return '**Product Rule:** If h(x) = f(x)·g(x), then:\n\nh\'(x) = **f\'(x)·g(x) + f(x)·g\'(x)**\n\nMemory trick: "first · d(second) + second · d(first)"\n\nExample: d/dx[x²·sin(x)] = 2x·sin(x) + x²·cos(x) ✓';
  }
  if (msg.includes('help') || msg.includes('stuck') || msg.includes('don\'t understand')) {
    return 'No worries! Let\'s slow down. 😊\n\nThe key insight for Chain Rule is recognizing **nested functions**. Ask yourself:\n- What is the "outside" function?\n- What is the "inside" function?\n\nFor example, in (x²+1)³:\n- Outside: (\_)³\n- Inside: x²+1\n\nOnce you identify them, apply: **d(outside) × d(inside)**\n\nWhat part is confusing you specifically?';
  }
  return `Great question about "${userMessage}"! 🤔\n\nIn JEE Mathematics, this is an important concept. Let me break it down step by step:\n\n1. Start with identifying what type of differentiation rule applies\n2. Apply the relevant rule systematically\n3. Simplify the result\n\nCan you tell me what step you got stuck on? That will help me give you the most targeted explanation. 🎯`;
}

export const DEMO_AI_CONFIG = {
  active_provider: 'mock',
  is_live_ai: false,
  gemini_configured: false,
  openai_configured: false,
  model: 'demo-mode',
};

export const DEMO_LESSON: ConceptLessonData = {
  concept_id: 7,
  concept_name: 'Chain Rule',
  description: 'Rule for differentiating composite functions',
  explanation: 'The Chain Rule is essential for differentiating composite functions f(g(x)). The derivative is f\'(g(x)) · g\'(x).',
  key_formulas: ['d/dx[f(g(x))] = f\'(g(x)) · g\'(x)', 'd/dx[sin(x²)] = cos(x²) · 2x', 'd/dx[(3x+1)⁵] = 5(3x+1)⁴ · 3'],
  common_mistakes: ['Forgetting to multiply by the inner derivative', 'Confusing Chain Rule with Product Rule'],
  lessons: [
    { id: 1, title: 'Chain Rule — Introduction', content: 'The Chain Rule: if y = f(g(x)), then dy/dx = f\'(g(x)) · g\'(x). Think of it as "derivative of outside times derivative of inside".', difficulty: 'beginner', lesson_type: 'explanation' },
    { id: 2, title: 'Chain Rule — Worked Examples', content: 'Example 1: d/dx[sin(x²)] = cos(x²) · 2x\nExample 2: d/dx[(x³+1)⁴] = 4(x³+1)³ · 3x²\nExample 3: d/dx[e^(2x)] = e^(2x) · 2', difficulty: 'intermediate', lesson_type: 'examples' },
    { id: 3, title: 'Chain Rule — Practice Problems', content: 'Try these: 1) d/dx[(5x+2)³] 2) d/dx[cos(x²)] 3) d/dx[√(x²+1)]', difficulty: 'intermediate', lesson_type: 'practice' },
  ],
};

export const DEMO_RECOVERY_PLAN: RecoveryPlanResponse = {
  recovery_plan: [
    {
      concept_name: 'Chain Rule',
      selection_reason: 'Confirmed misconception: forgetting inner derivative. Highest impact on 4 dependent concepts.',
      recommended_lesson: { id: 1, title: 'Chain Rule — Step-by-Step', lesson_type: 'explanation', estimated_duration_display: '15 min' },
      practice_questions_count: 5,
      estimated_duration_display: '25 min',
      mastery_check: { criterion: '≥80% accuracy over 5 questions', verification_method: 'targeted reassessment' },
      next_recommended_action: 'Complete lesson then take 5-question practice set',
    },
    {
      concept_name: 'Product Rule',
      selection_reason: 'Developing level — needs 3 more correct answers to reach mastery threshold.',
      recommended_lesson: { id: 2, title: 'Product Rule — Consolidation', lesson_type: 'practice', estimated_duration_display: '10 min' },
      practice_questions_count: 3,
      estimated_duration_display: '15 min',
      mastery_check: { criterion: '≥80% accuracy over 5 questions', verification_method: 'inline practice' },
      next_recommended_action: 'Complete 3 additional practice questions',
    },
  ],
  generated_at: new Date().toISOString(),
  data_provenance: 'Generated from 24 assessed responses across 8 concepts',
};
