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

const API_BASE = '/api';

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
  async login(username: string, password: string): Promise<{ message: string; user: User; access_token?: string }> {
    const res = await this.request<{ message: string; user: User; access_token?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (res.access_token) {
      this.setToken(res.access_token);
    }
    return res;
  }

  async register(data: {
    email: string;
    username: string;
    display_name: string;
    password: string;
    grade?: string;
  }): Promise<{ message: string; user: User; access_token?: string }> {
    const res = await this.request<{ message: string; user: User; access_token?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.access_token) {
      this.setToken(res.access_token);
    }
    return res;
  }

  async demoLogin(): Promise<{ message: string; user: User; access_token?: string }> {
    const res = await this.request<{ message: string; user: User; access_token?: string }>('/auth/demo-login', {
      method: 'POST',
    });
    if (res.access_token) {
      this.setToken(res.access_token);
    }
    return res;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async updateProfile(data: { display_name?: string; grade?: string; learning_goal?: string }): Promise<User> {
    return this.request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Dashboard
  async getDashboard(): Promise<DashboardData> {
    return this.request<DashboardData>('/dashboard');
  }

  // Concepts & Knowledge Graph
  async getConcepts(topicId?: number) {
    const query = topicId ? `?topic_id=${topicId}` : '';
    return this.request<any[]>(`/concepts${query}`);
  }

  async getConceptGraph(topicId?: number): Promise<ConceptGraphData> {
    const query = topicId ? `?topic_id=${topicId}` : '';
    return this.request<ConceptGraphData>(`/concepts/graph${query}`);
  }

  async getConceptDetails(conceptId: number): Promise<ConceptDetails> {
    return this.request<ConceptDetails>(`/concepts/${conceptId}`);
  }

  async getPracticeQuestions(conceptId: number, limit: number = 5) {
    return this.request<any[]>(`/concepts/${conceptId}/practice?limit=${limit}`);
  }

  // Assessments
  async createAssessment(sessionType: string = 'diagnostic', topicId?: number, parentSessionId?: number): Promise<Assessment> {
    return this.request<Assessment>('/assessments', {
      method: 'POST',
      body: JSON.stringify({
        session_type: sessionType,
        topic_id: topicId,
        parent_session_id: parentSessionId,
      }),
    });
  }

  async getAssessment(assessmentId: number): Promise<Assessment> {
    return this.request<Assessment>(`/assessments/${assessmentId}`);
  }

  async submitAnswer(
    assessmentId: number,
    questionId: number,
    selectedAnswer: string,
    responseTimeSeconds?: number,
    hintUsed: boolean = false,
    hintsRevealed: number = 0
  ): Promise<AnswerResult> {
    return this.request<AnswerResult>(`/assessments/${assessmentId}/answers`, {
      method: 'POST',
      body: JSON.stringify({
        question_id: questionId,
        selected_answer: selectedAnswer,
        response_time_seconds: responseTimeSeconds,
        hint_used: hintUsed,
        hints_revealed: hintsRevealed,
      }),
    });
  }

  async completeAssessment(assessmentId: number): Promise<AssessmentSummary> {
    return this.request<AssessmentSummary>(`/assessments/${assessmentId}/complete`, {
      method: 'POST',
    });
  }

  // Diagnosis
  async analyzeIncorrectAnswer(assessmentId: number, responseId: number): Promise<Diagnosis> {
    return this.request<Diagnosis>('/diagnosis/analyze', {
      method: 'POST',
      body: JSON.stringify({
        assessment_id: assessmentId,
        response_id: responseId,
      }),
    });
  }

  async getDiagnosis(diagnosisId: number): Promise<Diagnosis> {
    return this.request<Diagnosis>(`/diagnosis/${diagnosisId}`);
  }

  async answerFollowUp(
    diagnosisId: number,
    questionId: number,
    selectedAnswer: string,
    responseTimeSeconds?: number
  ): Promise<Diagnosis> {
    return this.request<Diagnosis>('/diagnosis/follow-up', {
      method: 'POST',
      body: JSON.stringify({
        diagnosis_id: diagnosisId,
        question_id: questionId,
        selected_answer: selectedAnswer,
        response_time_seconds: responseTimeSeconds,
      }),
    });
  }

  async getTimeline(diagnosisId?: number): Promise<InvestigationTimelineResponse> {
    const endpoint = diagnosisId ? `/diagnosis/${diagnosisId}/timeline` : '/diagnosis/timeline';
    const res = await this.request<any>(endpoint);
    if (Array.isArray(res)) {
      return { timeline: res, total_investigations: res.length };
    }
    return { timeline: res ? [res] : [], total_investigations: res ? 1 : 0 };
  }

  async getTechnicalTelemetry(diagnosisId: number): Promise<TechnicalTelemetry> {
    return this.request<TechnicalTelemetry>(`/diagnosis/${diagnosisId}/telemetry`);
  }

  async getRecoveryPlan(): Promise<RecoveryPlanResponse> {
    return this.request<RecoveryPlanResponse>('/learning/recovery-plan');
  }

  // AI Tutor
  async createTutorSession(mode: string = 'beginner', conceptId?: number): Promise<TutorSession> {
    return this.request<TutorSession>('/tutor/sessions', {
      method: 'POST',
      body: JSON.stringify({ mode, concept_id: conceptId }),
    });
  }

  async listTutorSessions(): Promise<TutorSession[]> {
    return this.request<TutorSession[]>('/tutor/sessions');
  }

  async getTutorSession(sessionId: number): Promise<TutorSession> {
    return this.request<TutorSession>(`/tutor/sessions/${sessionId}`);
  }

  async sendTutorMessage(sessionId: number, content: string): Promise<{
    user_message: { role: string; content: string; created_at?: string };
    assistant_message: { role: string; content: string; created_at?: string };
  }> {
    return this.request<{
      user_message: { role: string; content: string; created_at?: string };
      assistant_message: { role: string; content: string; created_at?: string };
    }>(`/tutor/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Learning Path & Lessons
  async getLearningPath(): Promise<LearningPath> {
    return this.request<LearningPath>('/learning/path');
  }

  async completeRecommendation(recommendationId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/learning/recommendations/${recommendationId}/complete`, {
      method: 'POST',
    });
  }

  async getLesson(conceptId: number): Promise<ConceptLessonData> {
    return this.request<ConceptLessonData>(`/learning/lessons/${conceptId}`);
  }

  async getProgressComparison(): Promise<ProgressComparison> {
    return this.request<ProgressComparison>('/learning/comparison');
  }

  // Demo
  async seedDemo(): Promise<{ message: string }> {
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
    return this.request('/settings/ai-config');
  }

  async updateAIConfig(data: { gemini_api_key?: string; openai_api_key?: string }): Promise<{
    success: boolean;
    active_provider: string;
    is_live_ai: boolean;
    message: string;
  }> {
    return this.request('/settings/ai-config', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
