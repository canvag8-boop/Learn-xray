import {
  User,
  DashboardData,
  ConceptGraphData,
  ConceptDetails,
  Assessment,
  AssessmentSummary,
  AnswerResult,
  Diagnosis,
  TutorSession,
  LearningPath,
  ConceptLessonData,
  ProgressComparison,
  InvestigationTimelineResponse,
  TechnicalTelemetry,
  RecoveryPlanResponse,
} from '../types';
import {
  DEMO_USER,
  DEMO_DASHBOARD,
  DEMO_CONCEPT_GRAPH,
  DEMO_CONCEPTS,
  DEMO_LEARNING_PATH,
  DEMO_PROGRESS,
  DEMO_TIMELINE,
  DEMO_TUTOR_SESSION,
  DEMO_AI_CONFIG,
  DEMO_LESSON,
  DEMO_RECOVERY_PLAN,
  makeDemoAssessment,
  makeDemoAssessmentSummary,
  submitDemoAnswer,
  getDemoTutorReply,
} from './mockData';

const API_BASE = '/api';

// Detect if we are on GitHub Pages (no backend available).
// Try the real health endpoint; if it fails, use mock data everywhere.
let _backendAvailable: boolean | null = null;

async function checkBackend(): Promise<boolean> {
  if (_backendAvailable !== null) return _backendAvailable;
  try {
    const res = await fetch('/health', { signal: AbortSignal.timeout(2000) });
    _backendAvailable = res.ok;
  } catch {
    _backendAvailable = false;
  }
  return _backendAvailable;
}

// Active sessions for demo mode
let _activeDemoAssessment: Assessment | null = null;
let _demoTutorMessages: TutorSession['messages'] = [...DEMO_TUTOR_SESSION.messages];

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('learnxray_token');
  }

  private setToken(token: string) {
    localStorage.setItem('learnxray_token', token);
  }

  private clearToken() {
    localStorage.removeItem('learnxray_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Auth
  async login(_username: string, _password: string): Promise<{ message: string; user: User; access_token?: string }> {
    if (!(await checkBackend())) {
      return { message: 'Demo mode', user: DEMO_USER };
    }
    const res = await this.request<{ message: string; user: User; access_token?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: _username, password: _password }),
    });
    if (res.access_token) this.setToken(res.access_token);
    return res;
  }

  async register(_data: { email: string; username: string; display_name: string; password: string; grade?: string }): Promise<{ message: string; user: User; access_token?: string }> {
    if (!(await checkBackend())) {
      return { message: 'Demo mode', user: DEMO_USER };
    }
    const res = await this.request<{ message: string; user: User; access_token?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(_data),
    });
    if (res.access_token) this.setToken(res.access_token);
    return res;
  }

  async demoLogin(): Promise<{ message: string; user: User; access_token?: string }> {
    if (!(await checkBackend())) {
      return { message: 'Demo mode active', user: DEMO_USER };
    }
    const res = await this.request<{ message: string; user: User; access_token?: string }>('/auth/demo-login', {
      method: 'POST',
    });
    if (res.access_token) this.setToken(res.access_token);
    return res;
  }

  async logout(): Promise<void> {
    this.clearToken();
    if (!(await checkBackend())) return;
    try { await this.request('/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
  }

  async getMe(): Promise<User> {
    if (!(await checkBackend())) return DEMO_USER;
    return this.request<User>('/auth/me');
  }

  async updateProfile(data: { display_name?: string; grade?: string; learning_goal?: string }): Promise<User> {
    if (!(await checkBackend())) return { ...DEMO_USER, ...data };
    return this.request<User>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) });
  }

  // Dashboard
  async getDashboard(): Promise<DashboardData> {
    if (!(await checkBackend())) return DEMO_DASHBOARD;
    return this.request<DashboardData>('/dashboard');
  }

  // Concepts & Knowledge Graph
  async getConcepts(_topicId?: number) {
    if (!(await checkBackend())) return Object.values(DEMO_CONCEPTS);
    const query = _topicId ? `?topic_id=${_topicId}` : '';
    return this.request<any[]>(`/concepts${query}`);
  }

  async getConceptGraph(_topicId?: number): Promise<ConceptGraphData> {
    if (!(await checkBackend())) return DEMO_CONCEPT_GRAPH;
    const query = _topicId ? `?topic_id=${_topicId}` : '';
    return this.request<ConceptGraphData>(`/concepts/graph${query}`);
  }

  async getConceptDetails(conceptId: number): Promise<ConceptDetails> {
    if (!(await checkBackend())) {
      const concept = DEMO_CONCEPTS[conceptId];
      if (concept) return concept;
      // Return the first available concept as fallback
      return Object.values(DEMO_CONCEPTS)[0];
    }
    return this.request<ConceptDetails>(`/concepts/${conceptId}`);
  }

  async getPracticeQuestions(_conceptId: number, _limit: number = 5) {
    if (!(await checkBackend())) return [];
    return this.request<any[]>(`/concepts/${_conceptId}/practice?limit=${_limit}`);
  }

  // Assessments
  async createAssessment(_sessionType: string = 'diagnostic', _topicId?: number, _parentSessionId?: number): Promise<Assessment> {
    if (!(await checkBackend())) {
      _activeDemoAssessment = makeDemoAssessment();
      return _activeDemoAssessment;
    }
    return this.request<Assessment>('/assessments', {
      method: 'POST',
      body: JSON.stringify({ session_type: _sessionType, topic_id: _topicId, parent_session_id: _parentSessionId }),
    });
  }

  async getAssessment(assessmentId: number): Promise<Assessment> {
    if (!(await checkBackend())) {
      return _activeDemoAssessment || makeDemoAssessment();
    }
    return this.request<Assessment>(`/assessments/${assessmentId}`);
  }

  async submitAnswer(
    assessmentId: number,
    questionId: number,
    selectedAnswer: string,
    _responseTimeSeconds?: number,
    _hintUsed: boolean = false,
    _hintsRevealed: number = 0
  ): Promise<AnswerResult> {
    if (!(await checkBackend())) {
      const { result, assessment } = submitDemoAnswer(assessmentId, questionId, selectedAnswer);
      _activeDemoAssessment = assessment;
      return result;
    }
    return this.request<AnswerResult>(`/assessments/${assessmentId}/answers`, {
      method: 'POST',
      body: JSON.stringify({
        question_id: questionId,
        selected_answer: selectedAnswer,
        response_time_seconds: _responseTimeSeconds,
        hint_used: _hintUsed,
        hints_revealed: _hintsRevealed,
      }),
    });
  }

  async completeAssessment(assessmentId: number): Promise<AssessmentSummary> {
    if (!(await checkBackend())) {
      return makeDemoAssessmentSummary(assessmentId);
    }
    return this.request<AssessmentSummary>(`/assessments/${assessmentId}/complete`, { method: 'POST' });
  }

  // Diagnosis
  async analyzeIncorrectAnswer(_assessmentId: number, _responseId: number): Promise<Diagnosis> {
    if (!(await checkBackend())) {
      return {
        id: 1,
        status: 'investigating',
        hypotheses: [
          {
            id: 1, concept_name: 'Chain Rule', misconception: 'Forgetting inner derivative',
            confidence: 'high', confidence_score: 0.82,
            evidence_for: ['Selected answer ignores inner function derivative', 'Similar pattern on 2 previous questions'],
            evidence_against: ['Correctly applied power rule on basic problems'],
            recommended_intervention: 'Chain Rule step-by-step practice with 3 worked examples',
            status: 'confirmed',
          },
        ],
        follow_up_question: {
          id: 101, question_text: 'What is d/dx of (x² + 1)?',
          difficulty: 'beginner', question_type: 'mcq',
          choices: [{ label: 'A', text: '2x' }, { label: 'B', text: 'x' }, { label: 'C', text: '2' }, { label: 'D', text: '2x+1' }],
          purpose: 'Verify Power Rule as prerequisite',
        },
        recommendation: 'Work through Chain Rule guided examples before retrying composite function problems.',
      };
    }
    return this.request<Diagnosis>('/diagnosis/analyze', {
      method: 'POST',
      body: JSON.stringify({ assessment_id: _assessmentId, response_id: _responseId }),
    });
  }

  async getDiagnosis(_diagnosisId: number): Promise<Diagnosis> {
    if (!(await checkBackend())) {
      return {
        id: _diagnosisId, status: 'diagnosed',
        hypotheses: [{
          id: 1, concept_name: 'Chain Rule', misconception: 'Forgetting inner derivative',
          confidence: 'high', confidence_score: 0.82,
          evidence_for: ['Pattern found across 3 incorrect answers'],
          evidence_against: [],
          recommended_intervention: 'Chain Rule practice with guided examples',
          status: 'confirmed',
        }],
        recommendation: 'Complete the Chain Rule lesson and take a 5-question follow-up.',
      };
    }
    return this.request<Diagnosis>(`/diagnosis/${_diagnosisId}`);
  }

  async answerFollowUp(_diagnosisId: number, _questionId: number, _selectedAnswer: string, _responseTimeSeconds?: number): Promise<Diagnosis> {
    if (!(await checkBackend())) {
      return {
        id: _diagnosisId, status: 'resolved',
        hypotheses: [{
          id: 1, concept_name: 'Chain Rule', misconception: 'Forgetting inner derivative',
          confidence: 'high', confidence_score: 0.82,
          evidence_for: ['Confirmed by follow-up response'],
          evidence_against: [],
          recommended_intervention: 'Chain Rule lesson + 5 practice questions',
          status: 'confirmed',
        }],
        recommendation: 'Misconception confirmed. Start Chain Rule lesson to fix the gap.',
      };
    }
    return this.request<Diagnosis>('/diagnosis/follow-up', {
      method: 'POST',
      body: JSON.stringify({ diagnosis_id: _diagnosisId, question_id: _questionId, selected_answer: _selectedAnswer, response_time_seconds: _responseTimeSeconds }),
    });
  }

  async getTimeline(_diagnosisId?: number): Promise<InvestigationTimelineResponse> {
    if (!(await checkBackend())) return DEMO_TIMELINE;
    const endpoint = _diagnosisId ? `/diagnosis/${_diagnosisId}/timeline` : '/diagnosis/timeline';
    const res = await this.request<any>(endpoint);
    if (Array.isArray(res)) return { timeline: res, total_investigations: res.length };
    return { timeline: res ? [res] : [], total_investigations: res ? 1 : 0 };
  }

  async getTechnicalTelemetry(_diagnosisId: number): Promise<TechnicalTelemetry> {
    if (!(await checkBackend())) {
      return {
        diagnosis_id: _diagnosisId, status: 'resolved',
        selected_diagnostic_rule: 'chain_rule_inner_derivative_check',
        rule_description: 'Detects when students apply outer derivative correctly but omit the inner derivative multiplication step.',
        evidence_used: [
          { type: 'answer_pattern', value: 'Missing inner derivative factor', weight: 0.8 },
          { type: 'concept_history', value: 'Chain Rule: 1/4 correct', weight: 0.6 },
        ],
        graph_relationships_traversed: [
          { source: 'Chain Rule', target: 'Power Rule', relation: 'prerequisite_of' },
          { source: 'Chain Rule', target: 'Implicit Differentiation', relation: 'enables' },
        ],
        intervention_recommendation: {
          intervention: 'chain_rule_step_by_step_lesson',
          rationale: 'High confidence misconception requires explicit step decomposition practice.',
        },
        assessment_updates: [
          { concept: 'Chain Rule', previous_state: 'developing', updated_state: 'needs_practice', confidence_delta: -0.24 },
        ],
        engine_mode: 'demo_mock',
        timestamp: new Date().toISOString(),
      };
    }
    return this.request<TechnicalTelemetry>(`/diagnosis/${_diagnosisId}/telemetry`);
  }

  async getRecoveryPlan(): Promise<RecoveryPlanResponse> {
    if (!(await checkBackend())) return DEMO_RECOVERY_PLAN;
    return this.request<RecoveryPlanResponse>('/learning/recovery-plan');
  }

  // AI Tutor
  async createTutorSession(_mode: string = 'beginner', _conceptId?: number): Promise<TutorSession> {
    if (!(await checkBackend())) {
      _demoTutorMessages = [...DEMO_TUTOR_SESSION.messages];
      return { ...DEMO_TUTOR_SESSION, messages: _demoTutorMessages };
    }
    return this.request<TutorSession>('/tutor/sessions', {
      method: 'POST',
      body: JSON.stringify({ mode: _mode, concept_id: _conceptId }),
    });
  }

  async listTutorSessions(): Promise<TutorSession[]> {
    if (!(await checkBackend())) return [{ ...DEMO_TUTOR_SESSION, messages: _demoTutorMessages }];
    return this.request<TutorSession[]>('/tutor/sessions');
  }

  async getTutorSession(_sessionId: number): Promise<TutorSession> {
    if (!(await checkBackend())) return { ...DEMO_TUTOR_SESSION, messages: _demoTutorMessages };
    return this.request<TutorSession>(`/tutor/sessions/${_sessionId}`);
  }

  async sendTutorMessage(_sessionId: number, content: string): Promise<{
    user_message: { role: string; content: string; created_at?: string };
    assistant_message: { role: string; content: string; created_at?: string };
  }> {
    if (!(await checkBackend())) {
      const userMsg = { role: 'user', content, created_at: new Date().toISOString() };
      const assistantMsg = { role: 'assistant', content: getDemoTutorReply(content), created_at: new Date().toISOString() };
      _demoTutorMessages.push(userMsg, assistantMsg);
      return { user_message: userMsg, assistant_message: assistantMsg };
    }
    return this.request<{
      user_message: { role: string; content: string; created_at?: string };
      assistant_message: { role: string; content: string; created_at?: string };
    }>(`/tutor/sessions/${_sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Learning Path & Lessons
  async getLearningPath(): Promise<LearningPath> {
    if (!(await checkBackend())) return DEMO_LEARNING_PATH;
    return this.request<LearningPath>('/learning/path');
  }

  async completeRecommendation(_recommendationId: number): Promise<{ message: string }> {
    if (!(await checkBackend())) return { message: 'Marked as complete (demo mode)' };
    return this.request<{ message: string }>(`/learning/recommendations/${_recommendationId}/complete`, { method: 'POST' });
  }

  async getLesson(_conceptId: number): Promise<ConceptLessonData> {
    if (!(await checkBackend())) return DEMO_LESSON;
    return this.request<ConceptLessonData>(`/learning/lessons/${_conceptId}`);
  }

  async getProgressComparison(): Promise<ProgressComparison> {
    if (!(await checkBackend())) return DEMO_PROGRESS;
    return this.request<ProgressComparison>('/learning/comparison');
  }

  // Demo
  async seedDemo(): Promise<{ message: string }> {
    if (!(await checkBackend())) return { message: 'Demo mode — no seeding needed' };
    return this.request<{ message: string }>('/demo/seed', { method: 'POST' });
  }

  // Settings & AI Configuration
  async getAIConfig(): Promise<{
    active_provider: string;
    is_live_ai: boolean;
    gemini_configured: boolean;
    openai_configured: boolean;
    model: string;
  }> {
    if (!(await checkBackend())) return DEMO_AI_CONFIG;
    return this.request('/settings/ai-config');
  }

  async updateAIConfig(data: { gemini_api_key?: string; openai_api_key?: string }): Promise<{
    success: boolean;
    active_provider: string;
    is_live_ai: boolean;
    message: string;
  }> {
    if (!(await checkBackend())) return { success: false, active_provider: 'mock', is_live_ai: false, message: 'Backend not available in demo mode. Run locally to use live AI.' };
    return this.request('/settings/ai-config', { method: 'POST', body: JSON.stringify(data) });
  }
}

export const api = new ApiClient();
