import React, { useState } from 'react';
import { Diagnosis } from '../types';
import { api } from '../services/api';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  BookOpen, 
  MessageSquare, 
  Activity, 
  ShieldAlert,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DiagnosisInspectorProps {
  diagnosis: Diagnosis;
  onClose: () => void;
  onDiagnosisUpdated: (updated: Diagnosis) => void;
}

export const DiagnosisInspector: React.FC<DiagnosisInspectorProps> = ({
  diagnosis,
  onClose,
  onDiagnosisUpdated,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);
  const [followUpResult, setFollowUpResult] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFollowUpSubmit = async () => {
    if (!selectedAnswer || !diagnosis.follow_up_question) return;

    setIsSubmittingFollowUp(true);
    try {
      const updated = await api.answerFollowUp(
        diagnosis.id,
        diagnosis.follow_up_question.id,
        selectedAnswer
      );
      onDiagnosisUpdated(updated);
      setFollowUpResult('Diagnosis updated based on your response!');
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmittingFollowUp(false);
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return { text: 'High Confidence (Confirmed)', bg: 'rgba(244, 63, 94, 0.2)', border: '#f43f5e', color: '#f87171' };
      case 'moderate':
        return { text: 'Moderate Hypothesis', bg: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b', color: '#fbbf24' };
      default:
        return { text: 'Candidate Hypothesis', bg: 'rgba(56, 189, 248, 0.15)', border: '#38bdf8', color: '#38bdf8' };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(4, 7, 13, 0.82)',
      backdropFilter: 'blur(12px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="glass-panel" style={{
        maxWidth: '720px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px',
        border: '1px solid rgba(0, 242, 254, 0.3)',
        boxShadow: '0 0 50px rgba(0, 242, 254, 0.2)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(244, 63, 94, 0.4)',
            }}>
              <ShieldAlert size={24} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Misconception <span className="gradient-text">X-Ray</span>
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Status: <strong style={{ textTransform: 'uppercase', color: diagnosis.status === 'diagnosed' ? '#f87171' : '#38bdf8' }}>{diagnosis.status}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
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

        {/* Hypotheses Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
            Investigated Root Causes & Evidence
          </h4>

          {diagnosis.hypotheses.map((hyp) => {
            const badge = getConfidenceBadge(hyp.confidence);
            return (
              <div
                key={hyp.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: `1px solid ${badge.border}40`,
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Target Concept: <strong style={{ color: '#fff' }}>{hyp.concept_name}</strong>
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: badge.bg,
                    color: badge.color,
                    border: `1px solid ${badge.border}`,
                  }}>
                    {badge.text} ({Math.round(hyp.confidence_score * 100)}%)
                  </span>
                </div>

                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                  {hyp.misconception}
                </div>

                {/* Evidence Lists */}
                {hyp.evidence_for && hyp.evidence_for.length > 0 && (
                  <div style={{ fontSize: '0.825rem', color: '#fda4af' }}>
                    <div style={{ fontWeight: 600, marginBottom: '2px' }}>Evidence in support:</div>
                    <ul style={{ paddingLeft: '18px' }}>
                      {hyp.evidence_for.map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {hyp.evidence_against && hyp.evidence_against.length > 0 && (
                  <div style={{ fontSize: '0.825rem', color: '#6ee7b7' }}>
                    <div style={{ fontWeight: 600, marginBottom: '2px' }}>Evidence against:</div>
                    <ul style={{ paddingLeft: '18px' }}>
                      {hyp.evidence_against.map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Targeted Diagnostic Follow-Up Question */}
        {diagnosis.follow_up_question && (
          <div style={{
            background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Activity size={18} color="#38bdf8" />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>
                Diagnostic Follow-Up Question
              </h4>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              {diagnosis.follow_up_question.purpose || "Answer this short question to help us pinpoint whether you're missing a prerequisite or made a minor slip."}
            </p>

            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.95rem',
              fontWeight: 600,
              marginBottom: '16px',
            }}>
              {diagnosis.follow_up_question.question_text}
            </div>

            {/* Multiple Choice Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {diagnosis.follow_up_question.choices.map((choice) => (
                <button
                  key={choice.label}
                  onClick={() => setSelectedAnswer(choice.label)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: selectedAnswer === choice.label ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: selectedAnswer === choice.label ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: selectedAnswer === choice.label ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                    color: selectedAnswer === choice.label ? '#090d16' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}>
                    {choice.label}
                  </span>
                  <span style={{ fontSize: '0.9rem' }}>{choice.text}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleFollowUpSubmit}
              disabled={!selectedAnswer || isSubmittingFollowUp}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {isSubmittingFollowUp ? 'Refining Diagnosis...' : 'Submit Diagnostic Answer'}
            </button>

            {followUpResult && (
              <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#34d399', textAlign: 'center', fontWeight: 600 }}>
                {followUpResult}
              </div>
            )}
          </div>
        )}

        {/* Action Recommendation */}
        {diagnosis.recommendation && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '20px',
          }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', marginBottom: '6px' }}>
              💡 Prescribed Learning Intervention
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#fef3c7' }}>
              {diagnosis.recommendation}
            </p>
          </div>
        )}

        {/* Bottom Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              onClose();
              navigate('/tutor');
            }}
            className="btn btn-outline-glow"
          >
            <MessageSquare size={16} />
            Ask Tutor About This
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/path');
            }}
            className="btn btn-primary"
          >
            <BookOpen size={16} />
            Open Recommended Lesson
          </button>
        </div>
      </div>
    </div>
  );
};
