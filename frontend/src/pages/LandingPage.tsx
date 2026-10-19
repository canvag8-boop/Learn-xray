import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  BrainCircuit, 
  Search, 
  Target, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Layers, 
  Activity,
  Play
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleDemo = async () => {
    await demoLogin();
    navigate('/dashboard');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', paddingBottom: '80px' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        paddingTop: '60px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        {/* Glow badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          color: '#38bdf8',
          fontSize: '0.85rem',
          fontWeight: 700,
          boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)',
        }}>
          <Sparkles size={16} />
          <span>Next-Gen Misconception Diagnosis Engine for JEE Mathematics</span>
        </div>

        {/* Hero Title */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
        }}>
          Don’t just learn the answer. <br />
          <span className="gradient-text">Discover what’s stopping you</span> <br />
          from understanding it.
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          maxWidth: '680px',
          lineHeight: 1.6,
        }}>
          LearnX-Ray X-rays your mathematical thinking. When you make a mistake in Calculus,
          we trace it backwards through prerequisite graphs to diagnose the exact misconception—not just show you the answer.
        </p>

        {/* Call to Actions */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px' }}>
          <button
            onClick={handleDemo}
            className="btn btn-primary"
            style={{ padding: '14px 28px', fontSize: '1.05rem', borderRadius: 'var(--radius-lg)' }}
          >
            <Play size={18} fill="currentColor" />
            Launch Live Demo Account
          </button>

          <Link
            to="/assessment"
            className="btn btn-secondary"
            style={{ padding: '14px 28px', fontSize: '1.05rem', borderRadius: 'var(--radius-lg)' }}
          >
            Take 5-Min Diagnostic
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Social Proof / Tags */}
        <div style={{
          display: 'flex',
          gap: '24px',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginTop: '16px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#10b981" /> 15+ Verified Differentiation Questions
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#10b981" /> 10-Node Prerequisite Knowledge Graph
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#10b981" /> Multi-turn AI Tutor with Fallback Mode
          </span>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px' }}>
            How <span className="gradient-text">LearnX-Ray</span> Diagnoses Your Mind
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            Traditional platforms mark answers as wrong. LearnX-Ray performs root-cause analysis.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {/* Card 1 */}
          <div className="glass-panel glass-panel-interactive" style={{ padding: '32px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'rgba(0, 242, 254, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              border: '1px solid rgba(0, 242, 254, 0.3)',
            }}>
              <BrainCircuit size={26} color="#00f2fe" />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px' }}>
              Concept Knowledge Graph
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
              Visualizes calculus not as isolated formulas, but as an interconnected graph.
              Track mastery progression across Exponent Rules, Limits, Power Rule, and Chain Rule in real time.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel glass-panel-interactive" style={{ padding: '32px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'rgba(244, 63, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              border: '1px solid rgba(244, 63, 94, 0.3)',
            }}>
              <Search size={26} color="#f43f5e" />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px' }}>
              Misconception X-Ray
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
              Identifies candidate reasons for errors (e.g. forgetting the inner derivative vs exponent subtraction).
              Deploys targeted follow-up questions to isolate whether it's a conceptual gap or calculation slip.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel glass-panel-interactive" style={{ padding: '32px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'rgba(168, 85, 247, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              border: '1px solid rgba(168, 85, 247, 0.3)',
            }}>
              <Zap size={26} color="#c084fc" />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px' }}>
              Adaptive Prerequisite Repair
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
              Generates a personalized learning path targeting upstream prerequisite weaknesses before
              letting you re-attempt advanced composite problems. Compare before/after results to see measurable gains.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Callout Banner */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
        <div className="glass-panel" style={{
          padding: '40px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Hackathon Evaluation Ready
            </span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '6px', marginBottom: '8px' }}>
              Ready to see the diagnostic workflow in action?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '520px' }}>
              Log in with our seeded demo student account with 1 click to test the full assessment,
              diagnostic follow-up questions, knowledge graph, and AI tutor.
            </p>
          </div>

          <button
            onClick={handleDemo}
            className="btn btn-primary"
            style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}
          >
            <Play size={18} fill="currentColor" />
            Launch Demo Now
          </button>
        </div>
      </section>
    </div>
  );
};
