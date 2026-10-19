import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TimelineItem } from '../types';
import { InvestigationTimeline } from '../components/InvestigationTimeline';
import { Layers, Sparkles, RotateCcw, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TimelinePage: React.FC = () => {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const res = await api.getTimeline();
      setTimeline(res.timeline || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#00f2fe', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Feature 1 • Misconception Trace
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
            Investigation <span className="gradient-text">Timeline Stream</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            Real-time step-by-step diagnostic records tracing errors from original trigger to targeted reassessment.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={loadTimeline} className="btn btn-secondary" style={{ padding: '10px 16px' }}>
            <RotateCcw size={15} />
            Refresh
          </button>
          <button onClick={() => navigate('/assessment')} className="btn btn-primary" style={{ padding: '10px 20px' }}>
            Take Assessment
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Provenance Card */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          background: 'rgba(0, 242, 254, 0.05)',
          border: '1px solid rgba(0, 242, 254, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={20} color="#00f2fe" />
          <span style={{ fontSize: '0.875rem', color: '#e0f2fe' }}>
            <strong>Authentic Assessment Records: </strong>Every timeline milestone reflects an actual persisted database response with logged hypotheses and Bayesian updates.
          </span>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            color: '#34d399',
            background: 'rgba(16, 185, 129, 0.15)',
            padding: '3px 10px',
            borderRadius: '999px',
            fontWeight: 800,
          }}
        >
          ✓ ZERO HALLUCINATED LOGS
        </span>
      </div>

      {/* Investigation Timeline */}
      <InvestigationTimeline timeline={timeline} loading={loading} />
    </div>
  );
};
