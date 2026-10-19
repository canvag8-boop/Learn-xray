import React, { useState } from 'react';
import { TimelineItem, TechnicalTelemetry } from '../types';
import { api } from '../services/api';
import { TechnicalTelemetryModal } from './TechnicalTelemetryModal';
import {
  Clock,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  GitCommit,
  BookOpen,
  RotateCcw,
  Terminal,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface InvestigationTimelineProps {
  timeline: TimelineItem[];
  loading?: boolean;
}

export const InvestigationTimeline: React.FC<InvestigationTimelineProps> = ({
  timeline,
  loading = false,
}) => {
  const [activeTelemetry, setActiveTelemetry] = useState<TechnicalTelemetry | null>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenTelemetry = async (diagnosisId: number) => {
    setTelemetryLoading(true);
    try {
      const data = await api.getTechnicalTelemetry(diagnosisId);
      setActiveTelemetry(data);
    } catch (err) {
      console.error('Failed to load telemetry:', err);
    } finally {
      setTelemetryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Clock size={32} color="#00f2fe" style={{ animation: 'spinSlow 2s linear infinite', marginBottom: '12px' }} />
        <p>Loading Misconception Investigation Timeline...</p>
      </div>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '36px', textAlign: 'center' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(56, 189, 248, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            border: '1px solid rgba(56, 189, 248, 0.3)',
          }}
        >
          <Layers size={24} color="#38bdf8" />
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
          No Investigation Records Yet
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto' }}>
          When you submit an incorrect answer during a diagnostic assessment, the misconception engine initiates an active investigation session logged with empirical evidence.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#34d399',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              Verified Empirical Records
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              ({timeline.length} diagnostic events)
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px' }}>
            Misconception Investigation <span className="gradient-text">Timeline</span>
          </h2>
        </div>
      </div>

      {/* Timeline Stream */}
      <div style={{ position: 'relative', paddingLeft: '28px', borderLeft: '2px solid rgba(56, 189, 248, 0.25)', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {timeline.map((rawItem, idx) => {
          const item = {
            id: rawItem.id || (rawItem as any).diagnosis_id,
            status: rawItem.status || 'diagnosed',
            created_at: rawItem.created_at || new Date().toISOString(),
            trigger_question_id: rawItem.trigger_question_id || (rawItem as any).trigger_event?.question_id || 1,
            trigger_question_text: rawItem.trigger_question_text || (rawItem as any).trigger_event?.question_text || 'Derivative of composite function',
            original_selected_answer: rawItem.original_selected_answer || (rawItem as any).trigger_event?.student_answer || 'B',
            concepts_involved: (rawItem.concepts_involved && rawItem.concepts_involved.length > 0)
              ? rawItem.concepts_involved
              : ((rawItem as any).concept_involved ? [(rawItem as any).concept_involved.name] : ['Differentiation Rules']),
            candidate_misconceptions: rawItem.candidate_misconceptions || [],
            diagnostic_question: rawItem.diagnostic_question || ((rawItem as any).diagnostic_follow_ups?.[0] ? {
              id: (rawItem as any).diagnostic_follow_ups[0].question_id,
              question_text: (rawItem as any).diagnostic_follow_ups[0].question_text,
              purpose: (rawItem as any).diagnostic_follow_ups[0].purpose,
              choices: (rawItem as any).diagnostic_follow_ups[0].choices || []
            } : null),
            student_follow_up_response: rawItem.student_follow_up_response || ((rawItem as any).diagnostic_follow_ups?.[0]?.student_response ? {
              selected_answer: (rawItem as any).diagnostic_follow_ups[0].student_response.selected_answer,
              answered_at: (rawItem as any).diagnostic_follow_ups[0].student_response.answered_at,
              is_consistent_with_hypothesis: (rawItem as any).diagnostic_follow_ups[0].student_response.is_consistent_with_hypothesis ?? true
            } : null),
            selected_intervention: typeof rawItem.selected_intervention === 'string'
              ? rawItem.selected_intervention
              : ((rawItem as any).selected_intervention?.intervention || 'Targeted rule drills and prerequisite reinforcement.'),
            reassessment_result: rawItem.reassessment_result || ((rawItem as any).reassessment_results?.[0] ? {
              session_id: (rawItem as any).reassessment_results[0].session_id,
              status: (rawItem as any).reassessment_results[0].status,
              total_questions: (rawItem as any).reassessment_results[0].total_questions,
              correct_answers: (rawItem as any).reassessment_results[0].correct_answers,
              accuracy: (rawItem as any).reassessment_results[0].accuracy,
            } : null)
          };

          const isExpanded = expandedItems[item.id] ?? (idx === 0);
          return (
            <div key={item.id} style={{ position: 'relative' }}>
              {/* Timeline Marker Dot */}
              <div
                style={{
                  position: 'absolute',
                  left: '-37px',
                  top: '18px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: item.status === 'diagnosed' ? '#10b981' : '#f59e0b',
                  border: '3px solid #080d1a',
                  boxShadow: item.status === 'diagnosed' ? '0 0 12px rgba(16, 185, 129, 0.6)' : '0 0 12px rgba(245, 158, 11, 0.6)',
                }}
              />

              {/* Timeline Entry Card */}
              <div
                className="glass-panel"
                style={{
                  padding: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(15, 23, 42, 0.65)',
                }}
              >
                {/* Entry Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className={`badge ${item.status === 'diagnosed' ? 'badge-mastered' : 'badge-developing'}`}>
                        {item.status.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Logged: {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                      Investigation #{item.id}: Triggered by Question #{item.trigger_question_id}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleOpenTelemetry(item.id)}
                      className="btn btn-outline-glow"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Terminal size={14} color="#00f2fe" />
                      ⚡ Engine Telemetry
                    </button>
                    <button
                      onClick={() => toggleExpand(item.id)}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: 'none',
                        color: 'var(--text-muted)',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.8rem',
                      }}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Detail Grid */}
                {isExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '18px' }}>
                    {/* Step 1: The Original Incorrect Answer */}
                    <div style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.25)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <XCircle size={16} color="#f43f5e" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fda4af', textTransform: 'uppercase' }}>
                          Step 1: Original Trigger & Student Selection
                        </span>
                      </div>
                      <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                        "{item.trigger_question_text}"
                      </p>
                      <div style={{ fontSize: '0.85rem', color: '#fecdd3' }}>
                        Student selected: <strong style={{ color: '#fff', background: 'rgba(244, 63, 94, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>Option {item.original_selected_answer}</strong>
                      </div>
                    </div>

                    {/* Step 2: Concepts Involved */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Step 2: Concepts Involved
                      </span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {item.concepts_involved.map((concept, i) => (
                          <span
                            key={i}
                            style={{
                              background: 'rgba(56, 189, 248, 0.15)',
                              color: '#38bdf8',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                            }}
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Step 3: Candidate Misconceptions */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase' }}>
                        Step 3: Candidate Misconceptions Evaluated
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        {item.candidate_misconceptions.map((m, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: 'rgba(0, 0, 0, 0.25)',
                              padding: '10px 14px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.875rem',
                            }}
                          >
                            <div>
                              <strong style={{ color: '#f8fafc' }}>{m.misconception}</strong>
                              <span style={{ marginLeft: '8px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                [{m.status}]
                              </span>
                            </div>
                            <span
                              style={{
                                color: m.confidence === 'high' ? '#f87171' : m.confidence === 'moderate' ? '#fbbf24' : '#38bdf8',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                background: 'rgba(255, 255, 255, 0.06)',
                                padding: '3px 8px',
                                borderRadius: '4px',
                              }}
                            >
                              Confidence: {(m.confidence_score * 100).toFixed(0)}% ({m.confidence})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step 4 & 5: Diagnostic Follow-up & Student Response */}
                    {item.diagnostic_question && (
                      <div style={{ background: 'rgba(56, 189, 248, 0.06)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <HelpCircle size={16} color="#38bdf8" />
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                            Step 4 & 5: Diagnostic Probe & Follow-up Response
                          </span>
                        </div>
                        <p style={{ fontSize: '0.925rem', color: '#e0f2fe', marginBottom: '8px' }}>
                          <strong>Probe Question: </strong>"{item.diagnostic_question.question_text}"
                        </p>
                        {item.diagnostic_question.purpose && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                            <em>Purpose: {item.diagnostic_question.purpose}</em>
                          </p>
                        )}

                        {item.student_follow_up_response ? (
                          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem' }}>
                            <span style={{ color: '#bae6fd' }}>
                              Follow-up response answered: <strong>Option {item.student_follow_up_response.selected_answer}</strong> at {new Date(item.student_follow_up_response.answered_at).toLocaleTimeString()}
                            </span>
                            <div style={{ marginTop: '4px', color: item.student_follow_up_response.is_consistent_with_hypothesis ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
                              {item.student_follow_up_response.is_consistent_with_hypothesis
                                ? '✓ Validated: Consistent with candidate misconception pattern.'
                                : 'ℹ Response rules out primary misconception hypothesis.'}
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                            Follow-up question pending response.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 6: Selected Intervention */}
                    <div style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <BookOpen size={16} color="#c084fc" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#d8b4fe', textTransform: 'uppercase' }}>
                          Step 6: Selected Intervention
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#f3e8ff', lineHeight: 1.5 }}>
                        {item.selected_intervention || 'Targeted prerequisite review and rule disambiguation drills.'}
                      </p>
                    </div>

                    {/* Step 7: Reassessment Result */}
                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <RotateCcw size={16} color="#10b981" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6ee7b7', textTransform: 'uppercase' }}>
                          Step 7: Reassessment Result
                        </span>
                      </div>
                      {item.reassessment_result ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
                              {item.reassessment_result.accuracy}% Accuracy
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {item.reassessment_result.correct_answers} / {item.reassessment_result.total_questions} questions correct (Session #{item.reassessment_result.session_id})
                            </div>
                          </div>
                          <span
                            style={{
                              background: item.reassessment_result.accuracy >= 70 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                              color: item.reassessment_result.accuracy >= 70 ? '#34d399' : '#fbbf24',
                              padding: '6px 14px',
                              borderRadius: 'var(--radius-sm)',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                            }}
                          >
                            {item.reassessment_result.accuracy >= 70 ? 'Verified Mastery Gain' : 'Practice Reinforcement Ongoing'}
                          </span>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Reassessment pending — follow-up test scheduled to empirically measure mastery gains.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Engine Telemetry Modal */}
      {activeTelemetry && (
        <TechnicalTelemetryModal
          telemetry={activeTelemetry}
          loading={telemetryLoading}
          onClose={() => setActiveTelemetry(null)}
        />
      )}
    </div>
  );
};
