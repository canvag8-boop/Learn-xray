import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  BrainCircuit, 
  CheckCircle2, 
  Compass, 
  MessageSquare, 
  TrendingUp, 
  Sliders,
  Layers
} from 'lucide-react';
import { AISettingsModal } from './AISettingsModal';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [showSettings, setShowSettings] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(8, 11, 18, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
      }}>
        {/* Brand Logo */}
        <Link to="/dashboard" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textDecoration: 'none',
          color: 'inherit',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)',
          }}>
            <Sparkles size={22} color="#080b12" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>Learn<span className="gradient-text">X-Ray</span></span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Misconception Engine
            </div>
          </div>
        </Link>

        {/* Navigation Links — always visible */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link to="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
            borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
            color: isActive('/dashboard') ? '#fff' : 'var(--text-secondary)',
            background: isActive('/dashboard') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            border: isActive('/dashboard') ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
            transition: 'all 0.2s',
          }}>
            <TrendingUp size={16} color={isActive('/dashboard') ? '#818cf8' : 'currentColor'} />
            Dashboard
          </Link>

          <Link to="/graph" style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
            borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
            color: isActive('/graph') ? '#fff' : 'var(--text-secondary)',
            background: isActive('/graph') ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
            border: isActive('/graph') ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid transparent',
            transition: 'all 0.2s',
          }}>
            <BrainCircuit size={16} color={isActive('/graph') ? '#00f2fe' : 'currentColor'} />
            Knowledge Graph
          </Link>

          <Link to="/assessment" style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
            borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
            color: isActive('/assessment') ? '#fff' : 'var(--text-secondary)',
            background: isActive('/assessment') ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
            border: isActive('/assessment') ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
            transition: 'all 0.2s',
          }}>
            <CheckCircle2 size={16} color={isActive('/assessment') ? '#10b981' : 'currentColor'} />
            Diagnostic Test
          </Link>

          <Link to="/timeline" style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
            borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
            color: isActive('/timeline') ? '#fff' : 'var(--text-secondary)',
            background: isActive('/timeline') ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
            border: isActive('/timeline') ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid transparent',
            transition: 'all 0.2s',
          }}>
            <Layers size={16} color={isActive('/timeline') ? '#00f2fe' : 'currentColor'} />
            Timeline
          </Link>

          <Link to="/path" style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
            borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
            color: isActive('/path') ? '#fff' : 'var(--text-secondary)',
            background: isActive('/path') ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
            border: isActive('/path') ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
            transition: 'all 0.2s',
          }}>
            <Compass size={16} color={isActive('/path') ? '#f59e0b' : 'currentColor'} />
            Learning Path
          </Link>

          <Link to="/tutor" style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
            borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
            color: isActive('/tutor') ? '#fff' : 'var(--text-secondary)',
            background: isActive('/tutor') ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
            border: isActive('/tutor') ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid transparent',
            transition: 'all 0.2s',
          }}>
            <MessageSquare size={16} color={isActive('/tutor') ? '#c084fc' : 'currentColor'} />
            AI Tutor
          </Link>

          <Link to="/progress" style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
            borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
            color: isActive('/progress') ? '#fff' : 'var(--text-secondary)',
            background: isActive('/progress') ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            border: isActive('/progress') ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
            transition: 'all 0.2s',
          }}>
            <TrendingUp size={16} color={isActive('/progress') ? '#38bdf8' : 'currentColor'} />
            Progress
          </Link>
        </nav>

        {/* Right Action — AI Key settings only */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowSettings(true)}
            className="btn btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Connect AI Key (Google Gemini / OpenAI)"
          >
            <Sliders size={14} color="#00f2fe" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>AI Key</span>
          </button>
        </div>
      </div>

      <AISettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </header>
  );
};
