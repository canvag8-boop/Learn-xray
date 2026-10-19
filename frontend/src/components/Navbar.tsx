import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  BrainCircuit, 
  CheckCircle2, 
  Compass, 
  MessageSquare, 
  TrendingUp, 
  LogOut, 
  User as UserIcon,
  Play,
  Sliders,
  Layers
} from 'lucide-react';
import { AISettingsModal } from './AISettingsModal';

export const Navbar: React.FC = () => {
  const { user, logout, demoLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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
        <Link to="/" style={{
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

        {/* Navigation Links */}
        {user ? (
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Link
              to="/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isActive('/dashboard') ? '#fff' : 'var(--text-secondary)',
                background: isActive('/dashboard') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: isActive('/dashboard') ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <TrendingUp size={16} color={isActive('/dashboard') ? '#818cf8' : 'currentColor'} />
              Dashboard
            </Link>

            <Link
              to="/graph"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isActive('/graph') ? '#fff' : 'var(--text-secondary)',
                background: isActive('/graph') ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                border: isActive('/graph') ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <BrainCircuit size={16} color={isActive('/graph') ? '#00f2fe' : 'currentColor'} />
              Knowledge Graph
            </Link>

            <Link
              to="/assessment"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isActive('/assessment') ? '#fff' : 'var(--text-secondary)',
                background: isActive('/assessment') ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                border: isActive('/assessment') ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <CheckCircle2 size={16} color={isActive('/assessment') ? '#10b981' : 'currentColor'} />
              Diagnostic Test
            </Link>

            <Link
              to="/timeline"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isActive('/timeline') ? '#fff' : 'var(--text-secondary)',
                background: isActive('/timeline') ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                border: isActive('/timeline') ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <Layers size={16} color={isActive('/timeline') ? '#00f2fe' : 'currentColor'} />
              Timeline
            </Link>

            <Link
              to="/path"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isActive('/path') ? '#fff' : 'var(--text-secondary)',
                background: isActive('/path') ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                border: isActive('/path') ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <Compass size={16} color={isActive('/path') ? '#f59e0b' : 'currentColor'} />
              Learning Path
            </Link>

            <Link
              to="/tutor"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isActive('/tutor') ? '#fff' : 'var(--text-secondary)',
                background: isActive('/tutor') ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                border: isActive('/tutor') ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <MessageSquare size={16} color={isActive('/tutor') ? '#c084fc' : 'currentColor'} />
              AI Tutor
            </Link>

            <Link
              to="/progress"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isActive('/progress') ? '#fff' : 'var(--text-secondary)',
                background: isActive('/progress') ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                border: isActive('/progress') ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <TrendingUp size={16} color={isActive('/progress') ? '#38bdf8' : 'currentColor'} />
              Progress
            </Link>
          </nav>
        ) : null}

        {/* Right Action / Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Link
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: isActive('/profile') ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: isActive('/profile') ? '1px solid #6366f1' : '1px solid var(--border-subtle)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s',
                }}
                title="View Profile Settings"
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--gradient-brand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#fff',
                }}>
                  {user.display_name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.display_name}</span>
                {user.is_demo && (
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(56, 189, 248, 0.2)',
                    color: '#38bdf8',
                    fontWeight: 700,
                  }}>
                    DEMO
                  </span>
                )}
              </Link>

              <button
                onClick={() => setShowSettings(true)}
                className="btn btn-secondary"
                style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Connect AI Key (Google Gemini / OpenAI)"
              >
                <Sliders size={14} color="#00f2fe" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>AI Key</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="btn btn-secondary"
                style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                title="Log out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setShowSettings(true)}
                className="btn btn-secondary"
                style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Connect AI Key (Google Gemini / OpenAI)"
              >
                <Sliders size={14} color="#00f2fe" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>AI Key</span>
              </button>

              <button
                onClick={async () => {
                  await demoLogin();
                  navigate('/dashboard');
                }}
                className="btn btn-outline-glow"
                style={{ padding: '8px 16px', fontSize: '0.875rem' }}
              >
                <Play size={14} fill="currentColor" />
                Demo 1-Click
              </button>

              <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                Sign In
              </Link>

              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.875rem' }}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      <AISettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </header>
  );
};
