import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TechnicalTelemetryModal } from './TechnicalTelemetryModal';
import { TechnicalTelemetry } from '../types';
import {
  Trophy,
  Play,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Cpu,
  CheckCircle2,
  BrainCircuit,
  Compass,
  TrendingUp,
  Terminal,
  Layers,
  Database
} from 'lucide-react';

export const HackathonDemoBar: React.FC = () => {
  const { demoLogin, user } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSeeding, setIsSeeding] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('Ready for presentation');
  const [telemetryModal, setTelemetryModal] = useState<TechnicalTelemetry | null>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);

  const handleSeedAndLogin = async () => {
    setIsSeeding(true);
    setStatusMessage('Seeding deterministic demo data & logging in...');
    try {
      await api.seedDemo();
      await demoLogin();
      setActiveStep(2);
      setStatusMessage('✓ Seeded demo calculus records (Power Rule & Chain Rule). Logged in as Demo Student.');
    } catch (err: any) {
      console.error(err);
      setStatusMessage('Error seeding demo data');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleStepClick = async (step: number) => {
    setActiveStep(step);
    switch (step) {
      case 1:
        await handleSeedAndLogin();
        break;
      case 2:
        navigate('/assessment');
        setStatusMessage('Step 2: Adaptive Diagnostic Assessment active. Notice selection reasoning banner.');
        break;
      case 3:
        navigate('/timeline');
        setStatusMessage('Step 3: Misconception Timeline loaded with authentic trigger & follow-up probe records.');
        break;
      case 4:
        navigate('/graph');
        setStatusMessage('Step 4: Knowledge Graph loaded. Click "Power Rule" or "Chain Rule" for explainable drawer.');
        break;
      case 5:
        navigate('/path');
        setStatusMessage('Step 5: Structured Recovery Plan active with approximate duration and mastery checks.');
        break;
      case 6:
        setTelemetryLoading(true);
        setStatusMessage('Step 6: Opening Developer Telemetry inspector with rule ID & graph traversal.');
        try {
          const tList = await api.getTimeline();
          if (tList.timeline && tList.timeline.length > 0) {
            const tel = await api.getTechnicalTelemetry(tList.timeline[0].id);
            setTelemetryModal(tel);
          } else {
            setStatusMessage('No diagnosis records available yet. Seed demo data first.');
          }
        } catch (e) {
          console.error(e);
        } finally {
          setTelemetryLoading(false);
        }
        break;
      case 7:
        navigate('/progress');
        setStatusMessage('Step 7: Before-and-After Progress Comparison with verified empirical provenance.');
        break;
      case 8:
        await handleSeedAndLogin();
        navigate('/dashboard');
        setStatusMessage('Step 8: Reset complete. Ready for another repeatable presentation.');
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: '18px',
          right: '24px',
          zIndex: 90,
          maxWidth: isExpanded ? '860px' : '280px',
          width: 'calc(100% - 48px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div
          className="glass-panel"
          style={{
            padding: isExpanded ? '18px 24px' : '10px 18px',
            background: 'rgba(8, 14, 28, 0.94)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 242, 254, 0.4)',
            boxShadow: '0 8px 32px rgba(0, 242, 254, 0.25)',
            borderRadius: '16px',
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Trophy size={16} color="#080b12" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>
                    Hackathon Demo Controller
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#00f2fe',
                      background: 'rgba(0, 242, 254, 0.12)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid rgba(0, 242, 254, 0.3)',
                    }}
                  >
                    100% Offline Resilient
                  </span>
                </div>
                {isExpanded && (
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <Database size={12} color="#34d399" />
                    <span>Seeded Data: <strong>[Calculus Differentiation Suite]</strong> • Engine: <strong>SymPy + Bayesian Graph</strong></span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                }}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                <span>{isExpanded ? 'Minimize' : 'Walkthrough'}</span>
              </button>
            </div>
          </div>

          {/* Expanded Step-by-Step Scenario Buttons */}
          {isExpanded && (
            <div style={{ marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: '8px' }}>
                <button
                  onClick={() => handleStepClick(1)}
                  disabled={isSeeding}
                  style={{
                    background: activeStep === 1 ? 'rgba(0, 242, 254, 0.25)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${activeStep === 1 ? '#00f2fe' : 'rgba(255,255,255,0.1)'}`,
                    color: activeStep === 1 ? '#00f2fe' : 'var(--text-secondary)',
                    padding: '8px 6px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                  title="Step 1: Seed deterministic calculus data and log in demo student"
                >
                  1. Seed & Login
                </button>

                <button
                  onClick={() => handleStepClick(2)}
                  style={{
                    background: activeStep === 2 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${activeStep === 2 ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                    color: activeStep === 2 ? '#34d399' : 'var(--text-secondary)',
                    padding: '8px 6px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                  title="Step 2: Adaptive Diagnostic Assessment"
                >
                  2. Assessment
                </button>

                <button
                  onClick={() => handleStepClick(3)}
                  style={{
                    background: activeStep === 3 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${activeStep === 3 ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
                    color: activeStep === 3 ? '#38bdf8' : 'var(--text-secondary)',
                    padding: '8px 6px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                  title="Step 3: Misconception Investigation Timeline"
                >
                  3. Timeline
                </button>

                <button
                  onClick={() => handleStepClick(4)}
                  style={{
                    background: activeStep === 4 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${activeStep === 4 ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
                    color: activeStep === 4 ? '#fbbf24' : 'var(--text-secondary)',
                    padding: '8px 6px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                  title="Step 4: Explainable Knowledge Graph"
                >
                  4. Graph Drawer
                </button>

                <button
                  onClick={() => handleStepClick(5)}
                  style={{
                    background: activeStep === 5 ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${activeStep === 5 ? '#c084fc' : 'rgba(255,255,255,0.1)'}`,
                    color: activeStep === 5 ? '#c084fc' : 'var(--text-secondary)',
                    padding: '8px 6px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                  title="Step 5: Structured Recovery Plan"
                >
                  5. Recovery Plan
                </button>

                <button
                  onClick={() => handleStepClick(6)}
                  style={{
                    background: activeStep === 6 ? 'rgba(0, 242, 254, 0.25)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${activeStep === 6 ? '#00f2fe' : 'rgba(255,255,255,0.1)'}`,
                    color: activeStep === 6 ? '#00f2fe' : 'var(--text-secondary)',
                    padding: '8px 6px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                  title="Step 6: Developer Diagnostic Telemetry"
                >
                  6. Telemetry
                </button>

                <button
                  onClick={() => handleStepClick(7)}
                  style={{
                    background: activeStep === 7 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${activeStep === 7 ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                    color: activeStep === 7 ? '#34d399' : 'var(--text-secondary)',
                    padding: '8px 6px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                  title="Step 7: Before-and-After Progress Comparison"
                >
                  7. Progress Delta
                </button>

                <button
                  onClick={() => handleStepClick(8)}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-muted)',
                    padding: '8px 6px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                  title="Step 8: Reset scenario to re-run demo"
                >
                  <RotateCcw size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  Reset
                </button>
              </div>

              {/* Status Message Line */}
              <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#bae6fd', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="#00f2fe" />
                <span>{statusMessage}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Telemetry Modal triggered by Step 6 */}
      {telemetryModal && (
        <TechnicalTelemetryModal
          telemetry={telemetryModal}
          loading={telemetryLoading}
          onClose={() => setTelemetryModal(null)}
        />
      )}
    </>
  );
};
