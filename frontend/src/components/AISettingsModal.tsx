import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Sparkles, Key, CheckCircle2, ShieldCheck, X, ExternalLink } from 'lucide-react';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated?: () => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose, onConfigUpdated }) => {
  const [config, setConfig] = useState<{
    active_provider: string;
    is_live_ai: boolean;
    gemini_configured: boolean;
    openai_configured: boolean;
    model: string;
  } | null>(null);

  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    try {
      const data = await api.getAIConfig();
      setConfig(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiKey && !openaiKey) return;
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await api.updateAIConfig({
        gemini_api_key: geminiKey || undefined,
        openai_api_key: openaiKey || undefined,
      });
      setStatusMsg(res.message);
      await loadConfig();
      setGeminiKey('');
      setOpenaiKey('');
      if (onConfigUpdated) onConfigUpdated();
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
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
      padding: '20px',
    }}>
      <div className="glass-panel" style={{
        maxWidth: '560px',
        width: '100%',
        padding: '32px',
        border: '1px solid rgba(0, 242, 254, 0.3)',
        boxShadow: '0 0 40px rgba(0, 242, 254, 0.15)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Sparkles size={20} color="#080b12" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Connect AI Engine</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Enable live generation to answer any mathematical question
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Current Status Pill */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CURRENT ENGINE</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: config?.is_live_ai ? '#34d399' : '#fbbf24', textTransform: 'capitalize' }}>
              {config?.active_provider === 'gemini' ? 'Google Gemini 1.5 Flash' : config?.active_provider === 'openai' ? 'OpenAI GPT-4o-mini' : 'SymPy Solver & Offline Knowledge Base'}
            </div>
          </div>
          <span style={{
            fontSize: '0.72rem',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            background: config?.is_live_ai ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            color: config?.is_live_ai ? '#34d399' : '#fbbf24',
            fontWeight: 700,
          }}>
            {config?.is_live_ai ? 'LIVE ONLINE' : 'OFFLINE SOLVER'}
          </span>
        </div>

        {statusMsg && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: statusMsg.startsWith('Error') ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${statusMsg.startsWith('Error') ? '#f43f5e' : '#10b981'}`,
            color: statusMsg.startsWith('Error') ? '#f87171' : '#34d399',
            fontSize: '0.85rem',
            marginBottom: '16px',
          }}>
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Gemini Key Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#38bdf8' }}>
                Google Gemini API Key (Free)
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.75rem', color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                Get free key <ExternalLink size={12} />
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder={config?.gemini_configured ? "•••••••• (Already configured)" : "AIzaSy..."}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <Key size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* OpenAI Key Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#c084fc' }}>
                Or OpenAI API Key
              </label>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.75rem', color: '#c084fc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                OpenAI platform <ExternalLink size={12} />
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder={config?.openai_configured ? "•••••••• (Already configured)" : "sk-..."}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <Key size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            🔒 Keys are saved securely to your local <code>backend/.env</code> file on your computer and never exposed to the public.
          </div>

          <button
            type="submit"
            disabled={saving || (!geminiKey && !openaiKey)}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '6px' }}
          >
            {saving ? 'Validating & Activating...' : 'Activate AI Provider'}
          </button>
        </form>
      </div>
    </div>
  );
};
