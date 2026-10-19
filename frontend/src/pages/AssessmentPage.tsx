import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Assessment, Question, AnswerResult, AssessmentSummary, Diagnosis, TimelineItem } from '../types';
import { DiagnosisInspector } from '../components/DiagnosisInspector';
import { InvestigationTimeline } from '../components/InvestigationTimeline';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  BookOpen, 
  RotateCcw,
  Award,
  Layers,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

export const AssessmentPage: React.FC = () => {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  const [submittedResult, setSubmittedResult] = useState<AnswerResult | null>(null);
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDiagnosis, setActiveDiagnosis] = useState<Diagnosis | null>(null);
  const [summary, setSummary] = useState<AssessmentSummary | null>(null);
  const [summaryTimeline, setSummaryTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Keyboard navigation for accessibility: keys 1-4 or A-D, Enter to submit/advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (!submittedResult && currentQuestion?.choices) {
        if (e.key === '1' || e.key.toLowerCase() === 'a') setSelectedChoice('A');
        if (e.key === '2' || e.key.toLowerCase() === 'b') setSelectedChoice('B');
        if (e.key === '3' || e.key.toLowerCase() === 'c') setSelectedChoice('C');
        if (e.key === '4' || e.key.toLowerCase() === 'd') setSelectedChoice('D');
        if (e.key.toLowerCase() === 'h') setRevealedHints((prev) => Math.min(prev + 1, 2));
      }

      if (e.key === 'Enter') {
        if (!submittedResult && selectedChoice && !isSubmitting) {
          handleSubmitAnswer();
        } else if (submittedResult) {
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [submittedResult, currentQuestion, selectedChoice, isSubmitting]);

  // Timer effect while waiting for answer
  useEffect(() => {
    if (!currentQuestion || submittedResult) return;
    const interval = setInterval(() => {
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentQuestion, submittedResult]);

  const startNewAssessment = async (sessionType: string = 'diagnostic') => {
    setLoading(true);
    setSummary(null);
    setSubmittedResult(null);
    setSelectedChoice('');
    setRevealedHints(0);
    setTimeSpentSeconds(0);

    try {
      const sess = await api.createAssessment(sessionType);
      const detail = await api.getAssessment(sess.id);
      setAssessment(detail);
      setCurrentQuestion(detail.next_question || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!assessment || !currentQuestion || !selectedChoice || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await api.submitAnswer(
        assessment.id,
        currentQuestion.id,
        selectedChoice,
        timeSpentSeconds,
        revealedHints > 0,
        revealedHints
      );
      setSubmittedResult(res);

      // Auto-trigger confetti on correct!
      if (res.is_correct) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!assessment) return;
    setLoading(true);
    setSubmittedResult(null);
    setSelectedChoice('');
    setRevealedHints(0);
    setTimeSpentSeconds(0);

    try {
      const detail = await api.getAssessment(assessment.id);
      setAssessment(detail);
      if (detail.next_question) {
        setCurrentQuestion(detail.next_question);
      } else {
        // Complete the assessment
        const sum = await api.completeAssessment(assessment.id);
        setSummary(sum);
        setCurrentQuestion(null);
        try {
          const tRes = await api.getTimeline();
          setSummaryTimeline(tRes.timeline || []);
        } catch (e) {
          console.error(e);
        }
        if (sum.accuracy >= 0.7) {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectMisconception = async () => {
    if (!assessment || !submittedResult || submittedResult.is_correct) return;
    try {
      const res = await api.analyzeIncorrectAnswer(
        assessment.id,
        submittedResult.response_id || 0
      );
      setActiveDiagnosis(res);
    } catch (err) {
      console.error(err);
    }
  };

  // If no assessment started yet
  if (!assessment && !summary) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 35px rgba(0, 242, 254, 0.4)',
          }}>
            <Sparkles size={32} color="#080b12" />
          </div>

          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px' }}>
            Calculus Diagnostic Assessment
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 32px' }}>
            Take our verified adaptive test on Differentiation. Each answer is analyzed in real time.
            If you miss a problem, our misconception engine automatically detects whether the issue is with the power rule, chain rule, or prerequisite algebra.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => startNewAssessment('diagnostic')}
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '14px 32px', fontSize: '1.05rem', borderRadius: 'var(--radius-md)' }}
            >
              {loading ? 'Initializing Assessment...' : 'Start Diagnostic Assessment'}
            </button>

            <button
              onClick={() => startNewAssessment('practice')}
              disabled={loading}
              className="btn btn-secondary"
              style={{ padding: '14px 28px', fontSize: '1.05rem', borderRadius: 'var(--radius-md)' }}
            >
              Practice Mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Summary screen
  if (summary) {
    return (
      <div style={{ maxWidth: '780px', margin: '40px auto', padding: '0 20px' }}>
        <div className="glass-panel" style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Award size={32} color="#10b981" />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Assessment Complete!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
              Your answers have updated your knowledge graph and learning recommendations.
            </p>
          </div>

          {/* Stats Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '32px',
            textAlign: 'center',
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SCORE</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>
                {Math.round(summary.accuracy * 100)}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CORRECT</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>
                {summary.correct_count} / {summary.questions_answered}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>STATUS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>
                Profile Updated
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', marginBottom: '8px' }}>
                Strong Concepts
              </h4>
              {summary.strong_concepts.length > 0 ? (
                <ul style={{ paddingLeft: '16px', fontSize: '0.875rem', color: '#a7f3d0' }}>
                  {summary.strong_concepts.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>No concepts mastered yet.</p>
              )}
            </div>

            <div style={{ background: 'rgba(244, 63, 94, 0.08)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', marginBottom: '8px' }}>
                Concepts Needing Practice
              </h4>
              {summary.weak_concepts.length > 0 ? (
                <ul style={{ paddingLeft: '16px', fontSize: '0.875rem', color: '#fecdd3' }}>
                  {summary.weak_concepts.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>None! Excellent work.</p>
              )}
            </div>
          </div>

          {/* Action Navigation */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/path')}
              className="btn btn-primary"
              style={{ flex: 1, padding: '12px' }}
            >
              <BookOpen size={16} />
              View Prescribed Learning Path
            </button>

            <button
              onClick={() => navigate('/graph')}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '12px' }}
            >
              Inspect Knowledge Graph
            </button>

            <button
              onClick={() => startNewAssessment('diagnostic')}
              className="btn btn-outline-glow"
              style={{ padding: '12px 20px' }}
            >
              <RotateCcw size={16} />
              Retake
            </button>
          </div>

          {/* Feature 1: Misconception Investigation Timeline in Assessment Summary */}
          {summaryTimeline && summaryTimeline.length > 0 && (
            <div style={{ marginTop: '36px' }}>
              <InvestigationTimeline timeline={summaryTimeline} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active question view
  return (
    <div style={{ maxWidth: '840px', margin: '30px auto', padding: '0 20px' }}>
      {/* Question Card */}
      <div className="glass-panel" style={{ padding: '36px' }}>
        {/* Progress & Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-unassessed">
              {currentQuestion?.concept_name || 'Differentiation'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Difficulty: <strong style={{ color: '#fff', textTransform: 'capitalize' }}>{currentQuestion?.difficulty}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Clock size={15} color="#38bdf8" />
            <span>{timeSpentSeconds}s</span>
          </div>
        </div>

        {/* Feature 3: Adaptive Difficulty Calibration Banner */}
        {currentQuestion?.selection_reason && (
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#38bdf8" />
              <span style={{ fontSize: '0.85rem', color: '#bae6fd' }}>
                <strong>Adaptive Calibration: </strong>{currentQuestion.selection_reason}
              </span>
            </div>
            {currentQuestion.rule_applied && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                rule: {currentQuestion.rule_applied}
              </span>
            )}
          </div>
        )}

        {/* Question Text */}
        <div style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          lineHeight: 1.5,
          color: '#f8fafc',
          marginBottom: '20px',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          {currentQuestion?.question_text}
        </div>

        {/* Accessibility Helper Text */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Choose your answer:</span>
          <span>Accessibility: Keys 1-4 or A-D select, Enter submits</span>
        </div>

        {/* Choices */}
        <div
          role="radiogroup"
          aria-label="Question answer choices"
          style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}
        >
          {currentQuestion?.choices.map((choice) => {
            const isSelected = selectedChoice === choice.label;
            const isSubmitted = !!submittedResult;
            const isCorrectChoice = submittedResult && submittedResult.correct_answer === choice.label;
            const isWrongSelected = submittedResult && isSelected && !submittedResult.is_correct;

            let bgColor = 'rgba(255, 255, 255, 0.04)';
            let borderColor = 'var(--border-subtle)';
            let textColor = 'var(--text-primary)';

            if (isSubmitted) {
              if (isCorrectChoice) {
                bgColor = 'rgba(16, 185, 129, 0.15)';
                borderColor = '#10b981';
                textColor = '#6ee7b7';
              } else if (isWrongSelected) {
                bgColor = 'rgba(244, 63, 94, 0.15)';
                borderColor = '#f43f5e';
                textColor = '#fda4af';
              }
            } else if (isSelected) {
              bgColor = 'rgba(56, 189, 248, 0.15)';
              borderColor = '#38bdf8';
              textColor = '#fff';
            }

            return (
              <button
                key={choice.label}
                role="radio"
                aria-checked={isSelected}
                aria-label={`Option ${choice.label}: ${choice.text}`}
                disabled={isSubmitted}
                onClick={() => setSelectedChoice(choice.label)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: bgColor,
                  border: `1px solid ${borderColor}`,
                  color: textColor,
                  textAlign: 'left',
                  cursor: isSubmitted ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isSelected && !isSubmitted ? '0 0 15px rgba(56, 189, 248, 0.2)' : 'none',
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isSelected ? 'var(--gradient-brand)' : 'rgba(255, 255, 255, 0.08)',
                  color: isSelected ? '#fff' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}>
                  {choice.label}
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, flex: 1 }}>
                  {choice.text}
                </div>
                {isSubmitted && isCorrectChoice && <CheckCircle2 size={20} color="#10b981" />}
                {isSubmitted && isWrongSelected && <XCircle size={20} color="#f43f5e" />}
              </button>
            );
          })}
        </div>

        {/* Hints Toggle */}
        {!submittedResult && (
          <div style={{ marginBottom: '24px' }}>
            {revealedHints === 0 ? (
              <button
                onClick={() => setRevealedHints(1)}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '8px 14px' }}
              >
                <HelpCircle size={15} color="#38bdf8" />
                Need a hint?
              </button>
            ) : (
              <div style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                    💡 Hint #{revealedHints}
                  </span>
                  {revealedHints < 2 && currentQuestion?.hint_2 && (
                    <button
                      onClick={() => setRevealedHints(2)}
                      style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Show next hint
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '0.875rem', color: '#bae6fd' }}>
                  {revealedHints === 1 ? currentQuestion?.hint_1 : currentQuestion?.hint_2}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Answer Submission / Explanation Result */}
        {submittedResult ? (
          <div style={{
            background: submittedResult.is_correct ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
            border: `1px solid ${submittedResult.is_correct ? '#10b981' : '#f43f5e'}40`,
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              {submittedResult.is_correct ? (
                <>
                  <CheckCircle2 size={24} color="#10b981" />
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>
                    Correct! Outstanding work.
                  </span>
                </>
              ) : (
                <>
                  <XCircle size={24} color="#f43f5e" />
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f87171' }}>
                    Incorrect. Correct answer is option {submittedResult.correct_answer}.
                  </span>
                </>
              )}
            </div>

            <div style={{ fontSize: '0.925rem', color: '#f8fafc', lineHeight: 1.6, marginBottom: '16px' }}>
              <strong>Explanation: </strong> {submittedResult.explanation}
            </div>

            {/* Misconception Tag & Diagnosis CTA */}
            {!submittedResult.is_correct && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                background: 'rgba(0,0,0,0.3)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#fda4af', fontWeight: 700 }}>
                    POTENTIAL MISCONCEPTION DETECTED:
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>
                    {submittedResult.misconception_tag ? submittedResult.misconception_tag.replace(/_/g, ' ') : 'Fundamental Rule Execution'}
                  </div>
                </div>

                <button
                  onClick={handleInspectMisconception}
                  className="btn btn-outline-glow"
                  style={{ padding: '8px 14px', fontSize: '0.825rem' }}
                >
                  <ShieldAlert size={15} color="#00f2fe" />
                  Open Misconception X-Ray
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* Bottom Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={async () => {
              if (!assessment) return;
              const sum = await api.completeAssessment(assessment.id);
              setSummary(sum);
              setCurrentQuestion(null);
            }}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            End Assessment Early
          </button>

          {!submittedResult ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedChoice || isSubmitting}
              className="btn btn-primary"
              style={{ padding: '12px 28px' }}
            >
              {isSubmitting ? 'Evaluating Answer...' : 'Submit Answer'}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="btn btn-primary"
              style={{ padding: '12px 28px' }}
            >
              Next Question
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Misconception X-Ray Inspector Modal */}
      {activeDiagnosis && (
        <DiagnosisInspector
          diagnosis={activeDiagnosis}
          onClose={() => setActiveDiagnosis(null)}
          onDiagnosisUpdated={(updated) => setActiveDiagnosis(updated)}
        />
      )}
    </div>
  );
};
