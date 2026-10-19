import React from 'react';
import { TechnicalTelemetry } from '../types';
import { ShieldCheck, Cpu, GitFork, ArrowRight, X, Database, Terminal, FileCode } from 'lucide-react';

interface TechnicalTelemetryModalProps {
  telemetry: TechnicalTelemetry | null;
  loading?: boolean;
  onClose: () => void;
}

export const TechnicalTelemetryModal: React.FC<TechnicalTelemetryModalProps> = ({
  telemetry,
  loading = false,
  onClose,
}) => {
  if (!telemetry && !loading) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="telemetry-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 9, 17, 0.88)',
        backdropFilter: 'blur(12px)',
        zIndex: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '840px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px',
          border: '1px solid rgba(0, 242, 254, 0.4)',
          boxShadow: '0 0 60px rgba(0, 242, 254, 0.25)',
          background: 'rgba(10, 15, 29, 0.95)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#00f2fe',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  background: 'rgba(0, 242, 254, 0.12)',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border: '1px solid rgba(0, 242, 254, 0.3)',
                }}
              >
                Developer Diagnostics Telemetry
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                Engine Mode: {telemetry?.engine_mode || 'SymPy + Bayesian Rules'}
              </span>
            </div>
            <h2 id="telemetry-title" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc' }}>
              Engine Execution Trace & Proof
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Inspect rule evaluation, mathematical evidence, graph traversal, and state delta without exposing private keys or credentials.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close telemetry modal"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
            <Cpu size={36} color="#00f2fe" style={{ animation: 'spinSlow 2s linear infinite', marginBottom: '16px' }} />
            <p>Decompiling Diagnostic Decision Pipeline...</p>
          </div>
        ) : telemetry ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Rule Metadata Card */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Terminal size={18} color="#38bdf8" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8' }}>
                  1. Diagnostic Decision Rule
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Selected Rule ID: </span>
                  <code style={{ background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px', color: '#00f2fe' }}>
                    {telemetry.selected_diagnostic_rule}
                  </code>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Investigation Status: </span>
                  <strong style={{ color: telemetry.status === 'diagnosed' ? '#10b981' : '#f59e0b', textTransform: 'capitalize' }}>
                    {telemetry.status}
                  </strong>
                </div>
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.875rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-muted)' }}>Rule Description: </strong>
                {telemetry.rule_description}
              </div>
            </div>

            {/* Evidence Used */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Database size={18} color="#10b981" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399' }}>
                  2. Empirical Evidence Synthesized
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {telemetry.evidence_used.map((ev, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <div>
                      <span style={{ color: '#94a3b8' }}>[{ev.type}]: </span>
                      <span style={{ color: '#f8fafc' }}>{String(ev.value)}</span>
                    </div>
                    <span
                      style={{
                        color: '#34d399',
                        fontSize: '0.75rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      weight: {ev.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Knowledge Graph Traversal */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <GitFork size={18} color="#f59e0b" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fbbf24' }}>
                  3. Knowledge Graph Relationships Traversed
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {telemetry.graph_relationships_traversed.map((rel, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#f8fafc' }}>{rel.source}</span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#fbbf24',
                        background: 'rgba(245, 158, 11, 0.15)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      -- {rel.relation} --&gt;
                    </span>
                    <span style={{ fontWeight: 600, color: '#38bdf8' }}>{rel.target}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Intervention Rationale */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(192, 132, 252, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <ShieldCheck size={18} color="#c084fc" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#c084fc' }}>
                  4. Prescribed Intervention Rationale
                </h3>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#f8fafc', marginBottom: '6px' }}>
                <strong>Intervention Strategy: </strong>
                <span style={{ color: '#e9d5ff' }}>{telemetry.intervention_recommendation.intervention}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong>Pedagogical Rationale: </strong>
                {telemetry.intervention_recommendation.rationale}
              </div>
            </div>

            {/* Resulting Assessment Updates */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(0, 242, 254, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <FileCode size={18} color="#00f2fe" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#00f2fe' }}>
                  5. Resulting Assessment & Mastery Updates
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {telemetry.assessment_updates.map((upd, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                      Concept: {upd.concept}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#94a3b8' }}>{upd.previous_state}</span>
                      <ArrowRight size={14} color="#00f2fe" />
                      <span style={{ color: '#38bdf8', fontWeight: 700 }}>{upd.updated_state}</span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: upd.confidence_delta >= 0 ? '#34d399' : '#f87171',
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {upd.confidence_delta >= 0 ? `+${upd.confidence_delta}` : upd.confidence_delta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No telemetry records available for this investigation.
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '10px 24px' }}>
            Close Telemetry View
          </button>
        </div>
      </div>
    </div>
  );
};
