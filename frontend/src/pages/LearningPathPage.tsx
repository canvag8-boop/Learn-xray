import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { LearningPath, ConceptLessonData, RecoveryPlanItem } from '../types';
import { 
  Compass, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Target, 
  TrendingUp,
  X,
  AlertCircle,
  Clock,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';

export const LearningPathPage: React.FC = () => {
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [recoveryPlan, setRecoveryPlan] = useState<RecoveryPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recovery' | 'path'>('recovery');
  const [activeLesson, setActiveLesson] = useState<ConceptLessonData | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const loadPath = async () => {
    setLoading(true);
    try {
      const data = await api.getLearningPath();
      setLearningPath(data);

      try {
        const rp = await api.getRecoveryPlan();
        setRecoveryPlan(rp.recovery_plan || []);
      } catch (e) {
        console.error(e);
      }

      const conceptIdParam = searchParams.get('concept');
      if (conceptIdParam) {
        openLesson(parseInt(conceptIdParam, 10));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPath();
  }, [searchParams]);

  const openLesson = async (conceptId: number) => {
    setLoadingLesson(true);
    try {
      const lesson = await api.getLesson(conceptId);
      setActiveLesson(lesson);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLesson(false);
    }
  };

  const handleCompleteRecommendation = async (recId: number) => {
    try {
      await api.completeRecommendation(recId);
      await loadPath();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Prerequisite-Aware Sequence
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
            Prescribed <span className="gradient-text">Learning Path</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            Rooted in prerequisite dependency trees to solidify foundational rules before composite problem-solving.
          </p>
        </div>

        <button onClick={() => navigate('/progress')} className="btn btn-secondary">
          <TrendingUp size={16} color="#10b981" />
          View Progress Comparison
        </button>
      </div>

      {/* View Switcher: Feature 4 Structured Recovery Plan vs Sequential Curriculum Path */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('recovery')}
          style={{
            background: activeTab === 'recovery' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
            border: activeTab === 'recovery' ? '1px solid #00f2fe' : '1px solid transparent',
            color: activeTab === 'recovery' ? '#00f2fe' : 'var(--text-secondary)',
            padding: '10px 20px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldCheck size={18} />
          Structured Recovery Plan ({recoveryPlan.length} targets)
        </button>

        <button
          onClick={() => setActiveTab('path')}
          style={{
            background: activeTab === 'path' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
            border: activeTab === 'path' ? '1px solid #f59e0b' : '1px solid transparent',
            color: activeTab === 'path' ? '#f59e0b' : 'var(--text-secondary)',
            padding: '10px 20px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Compass size={18} />
          Sequential Curriculum Path
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          <Sparkles size={32} color="#f59e0b" style={{ animation: 'spinSlow 2s linear infinite', marginBottom: '16px' }} />
          <h3>Formulating Next Learning Steps...</h3>
        </div>
      ) : activeTab === 'recovery' ? (
        /* FEATURE 4: STRUCTURED RECOVERY PLAN */
        recoveryPlan && recoveryPlan.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Targeted remediation synthesized from your empirical diagnostic assessments.
              </span>
              <span style={{
                fontSize: '0.72rem',
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontWeight: 700,
              }}>
                ✓ Real Assessment Provenance
              </span>
            </div>

            {recoveryPlan.map((planItem, idx) => (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  padding: '28px',
                  border: '1px solid rgba(0, 242, 254, 0.25)',
                  background: 'rgba(15, 23, 42, 0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                }}
              >
                {/* Plan Item Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="badge badge-needs-practice">
                        Recovery Target #{idx + 1}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#bae6fd',
                        background: 'rgba(56, 189, 248, 0.15)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        <Clock size={12} />
                        Estimated Duration: <strong>{planItem.estimated_duration_display}</strong>
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
                      {planItem.concept_name}
                    </h3>
                  </div>

                  <button
                    onClick={() => openLesson(planItem.recommended_lesson.id)}
                    className="btn btn-primary"
                    style={{ padding: '10px 20px', fontSize: '0.875rem' }}
                  >
                    <BookOpen size={16} />
                    Open Lesson ({planItem.recommended_lesson.estimated_duration_display})
                  </button>
                </div>

                {/* Reason for Selection */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  borderLeft: '3px solid #00f2fe',
                }}>
                  <strong style={{ color: '#00f2fe' }}>Reason for Selection: </strong>
                  <span style={{ color: '#e2e8f0' }}>{planItem.selection_reason}</span>
                </div>

                {/* Detailed Plan Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                  {/* Recommended Lesson Card */}
                  <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '4px' }}>
                      Recommended Lesson
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                      {planItem.recommended_lesson.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginTop: '4px' }}>
                      Type: {planItem.recommended_lesson.lesson_type} • Approx: {planItem.recommended_lesson.estimated_duration_display}
                    </div>
                  </div>

                  {/* Practice Count & Drill */}
                  <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '4px' }}>
                      Prescribed Exercises
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                      {planItem.practice_questions_count} Practice Questions
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#fbbf24', marginTop: '4px' }}>
                      Approx Session Time: {planItem.estimated_duration_display}
                    </div>
                  </div>

                  {/* Mastery Check */}
                  <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '4px' }}>
                      Mastery Check Checkpoint
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399' }}>
                      {planItem.mastery_check.criterion}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Method: {planItem.mastery_check.verification_method}
                    </div>
                  </div>
                </div>

                {/* Next Recommended Action Banner */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(56, 189, 248, 0.08)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}>
                  <div>
                    <strong style={{ color: '#38bdf8' }}>Next Action: </strong>
                    <span style={{ color: '#f8fafc' }}>{planItem.next_recommended_action}</span>
                  </div>
                  <button
                    onClick={() => navigate('/assessment')}
                    className="btn btn-outline-glow"
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                  >
                    Start Remediation Test
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
            <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>No Conceptual Traps Pending</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '8px auto 24px' }}>
              Your recorded assessments show reliable mastery across evaluated differentiation concepts.
            </p>
            <button onClick={() => navigate('/assessment')} className="btn btn-primary">
              Take Diagnostic Assessment
            </button>
          </div>
        )
      ) : (
        /* Sequential Curriculum Path View */
        learningPath && learningPath.recommendations.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {learningPath.recommendations.map((rec) => {
              const isCompleted = rec.status === 'completed';
              return (
                <div
                  key={rec.id}
                  className="glass-panel"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '20px',
                    borderLeft: `4px solid ${rec.priority === 1 ? '#f43f5e' : rec.priority <= 3 ? '#f59e0b' : '#38bdf8'}`,
                    opacity: isCompleted ? 0.6 : 1,
                  }}
                >
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: 'var(--text-secondary)',
                      }}>
                        PRIORITY #{rec.priority}
                      </span>

                      <span className={`badge badge-${rec.recommendation_type === 'lesson' ? 'developing' : 'needs-practice'}`}>
                        {rec.recommendation_type}
                      </span>

                      {isCompleted && (
                        <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
                      {rec.concept_name}
                    </h3>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {rec.reason}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                      onClick={() => openLesson(rec.id)}
                      className="btn btn-primary"
                      style={{ padding: '10px 18px', fontSize: '0.875rem' }}
                    >
                      <BookOpen size={16} />
                      Open Lesson & Traps
                    </button>

                    {!isCompleted && (
                      <button
                        onClick={() => handleCompleteRecommendation(rec.id)}
                        className="btn btn-secondary"
                        style={{ padding: '10px 14px', fontSize: '0.85rem' }}
                        title="Mark as completed"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
            <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>All Recommendations Clear!</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '8px auto 24px' }}>
              You have addressed the active prerequisite recommendations. Take a new diagnostic assessment to test advanced calculus topics.
            </p>
            <button onClick={() => navigate('/assessment')} className="btn btn-primary">
              Start Diagnostic Test
            </button>
          </div>
        )
      )}

      {/* Lesson Reader Drawer / Modal */}
      {activeLesson && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 8, 15, 0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}>
          <div className="glass-panel" style={{
            maxWidth: '780px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '36px',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <span className="badge badge-developing" style={{ marginBottom: '8px' }}>
                  Lesson & Formula Reference
                </span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{activeLesson.concept_name}</h2>
              </div>
              <button
                onClick={() => setActiveLesson(null)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Formulas Box */}
            {activeLesson.key_formulas && activeLesson.key_formulas.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Mathematical Formulas
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeLesson.key_formulas.map((formula, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'rgba(56, 189, 248, 0.08)',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9rem',
                        color: '#bae6fd',
                      }}
                    >
                      {formula}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lesson Content Sections */}
            {activeLesson.lessons && activeLesson.lessons.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
                {activeLesson.lessons.map((lesson) => (
                  <div key={lesson.id} style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '12px', color: '#fff' }}>
                      {lesson.title}
                    </h3>
                    <div style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                      {lesson.content}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                {activeLesson.explanation || activeLesson.description}
              </p>
            )}

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => {
                  setActiveLesson(null);
                  navigate(`/tutor?concept=${activeLesson.concept_id}`);
                }}
                className="btn btn-outline-glow"
              >
                Ask AI Tutor
              </button>
              <button
                onClick={() => setActiveLesson(null)}
                className="btn btn-primary"
              >
                Close Lesson
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
