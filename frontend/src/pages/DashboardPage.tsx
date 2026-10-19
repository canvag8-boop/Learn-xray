import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { DashboardData, ConceptGraphData } from '../types';
import { 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  BrainCircuit, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  Activity, 
  HelpCircle,
  Play
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-secondary)' }}>
        <Sparkles size={36} color="#00f2fe" style={{ animation: 'spinSlow 3s linear infinite', marginBottom: '16px' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Synthesizing Student Learning Profile...</h3>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '32px', textAlign: 'center' }} className="glass-panel">
        <AlertTriangle size={36} color="#f43f5e" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Could not load dashboard</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{error}</p>
        <button onClick={loadDashboard} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const { stats, mastery_overview, next_recommendation, recent_activity } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        background: 'linear-gradient(135deg, rgba(14, 20, 36, 0.8) 0%, rgba(20, 30, 56, 0.8) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Diagnostic Learning Center
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
            Welcome back, <span className="gradient-text">{data.user.display_name}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '4px' }}>
            Goal: <strong>{data.user.learning_goal || 'Master JEE Differentiation'}</strong> • Grade: <strong>{data.user.grade || 'JEE Aspirant'}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/assessment')}
            className="btn btn-primary"
            style={{ padding: '12px 20px', borderRadius: 'var(--radius-md)' }}
          >
            <Play size={16} fill="currentColor" />
            Start Diagnostic Test
          </button>

          <button
            onClick={() => navigate('/graph')}
            className="btn btn-secondary"
            style={{ padding: '12px 20px', borderRadius: 'var(--radius-md)' }}
          >
            <BrainCircuit size={16} color="#00f2fe" />
            View Knowledge Graph
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
      }}>
        {/* Metric 1: Accuracy */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>DIAGNOSTIC ACCURACY</span>
            <TrendingUp size={20} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc' }}>
            {stats.accuracy_percentage}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {stats.questions_correct} of {stats.questions_attempted} questions correct
          </div>
        </div>

        {/* Metric 2: Mastered Concepts */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>MASTERED CONCEPTS</span>
            <CheckCircle2 size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#34d399' }}>
            {mastery_overview.mastered}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Demonstrated ≥80% sustained accuracy
          </div>
        </div>

        {/* Metric 3: Developing Concepts */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>DEVELOPING CONCEPTS</span>
            <Sparkles size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fbbf24' }}>
            {mastery_overview.developing}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            40% - 79% accuracy range
          </div>
        </div>

        {/* Metric 4: Needs Practice */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>MISCONCEPTIONS FLAGGED</span>
            <AlertTriangle size={20} color="#f43f5e" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f87171' }}>
            {mastery_overview.needs_practice}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Requires prerequisite or rule review
          </div>
        </div>
      </div>

      {/* Main Two Columns: Next Action & Activity Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Recommended Intervention Action */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Target size={18} color="#38bdf8" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                High-Priority Learning Intervention
              </h3>
            </div>

            {next_recommendation ? (
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                marginBottom: '20px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-needs-practice">
                    {next_recommendation.recommendation_type}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    PRIORITY #{next_recommendation.priority}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                  {next_recommendation.concept_name}
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {next_recommendation.reason}
                </p>
              </div>
            ) : (
              <div style={{
                padding: '24px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#6ee7b7',
                fontSize: '0.9rem',
                marginBottom: '20px',
              }}>
                🌟 Great standing! No critical prerequisite gaps currently identified. Start a new diagnostic test to evaluate higher order composite differentiation problems.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/path')}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              <BookOpen size={16} />
              Open Learning Path
            </button>
            <button
              onClick={() => navigate('/tutor')}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Ask AI Tutor
            </button>
          </div>
        </div>

        {/* Diagnostic Activity Timeline */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(168, 85, 247, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Activity size={18} color="#c084fc" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Recent Learning & Diagnostic Events
            </h3>
          </div>

          {recent_activity && recent_activity.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {recent_activity.map((act, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    paddingBottom: '12px',
                    borderBottom: i < recent_activity.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: act.event_type.includes('correct') ? '#10b981' : '#38bdf8',
                    marginTop: '6px',
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {act.description}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(act.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No diagnostic events yet. Start by taking your first assessment!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
