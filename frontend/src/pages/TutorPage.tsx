import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { TutorSession } from '../types';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User as UserIcon, 
  BookOpen, 
  HelpCircle, 
  Zap, 
  RotateCcw,
  MessageSquare
} from 'lucide-react';

export const TutorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialConceptId = searchParams.get('concept');

  const [session, setSession] = useState<TutorSession | null>(null);
  const [mode, setMode] = useState<TutorSession['mode']>('beginner');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const startSession = async (selectedMode: TutorSession['mode']) => {
    setLoading(true);
    try {
      const res = await api.createTutorSession(
        selectedMode,
        initialConceptId ? parseInt(initialConceptId, 10) : undefined
      );
      setSession(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startSession(mode);
  }, [initialConceptId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!session || !textToSend.trim() || sending) return;

    if (!customText) setInput('');
    setSending(true);

    // Optimistically add user message
    const tempUserMsg = { role: 'user' as const, content: textToSend };
    setSession((prev) => prev ? {
      ...prev,
      messages: [...prev.messages, tempUserMsg],
    } : null);

    try {
      const res = await api.sendTutorMessage(session.id, textToSend);
      // Replace with confirmed response
      setSession((prev) => {
        if (!prev) return null;
        const filtered = prev.messages.slice(0, prev.messages.length - 1);
        return {
          ...prev,
          messages: [...filtered, res.user_message, res.assistant_message],
        };
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleModeChange = (newMode: TutorSession['mode']) => {
    setMode(newMode);
    startSession(newMode);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 120px)' }}>
      {/* Header & Mode Controls */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#c084fc" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              AI Socratic Tutor <span className="gradient-text">{session?.concept_name ? `• ${session.concept_name}` : ''}</span>
            </h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Adaptive pedagogical assistant with fallback capability. Ask anything about differentiation rules.
          </p>
        </div>

        {/* Mode Selector Buttons */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: 'rgba(0,0,0,0.3)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
        }}>
          {[
            { id: 'beginner', label: 'Beginner' },
            { id: 'step_by_step', label: 'Step-by-Step' },
            { id: 'hint_only', label: 'Hint Only' },
            { id: 'exam_prep', label: 'JEE Prep' },
            { id: 'practice', label: 'Practice' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => handleModeChange(m.id as any)}
              style={{
                background: mode === m.id ? 'var(--gradient-brand)' : 'transparent',
                color: mode === m.id ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="glass-panel" style={{
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-secondary)' }}>
            Connecting to AI Tutor...
          </div>
        ) : (
          session?.messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                }}
              >
                {!isUser && (
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)',
                  }}>
                    <Bot size={18} color="#fff" />
                  </div>
                )}

                <div style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-lg)',
                  background: isUser ? 'rgba(99, 102, 241, 0.25)' : 'rgba(15, 23, 42, 0.85)',
                  border: `1px solid ${isUser ? 'rgba(99, 102, 241, 0.4)' : 'var(--border-subtle)'}`,
                  color: '#f8fafc',
                  fontSize: '0.925rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                }}>
                  {msg.content}
                </div>

                {isUser && (
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <UserIcon size={18} color="#fff" />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          'Can you explain the chain rule with an analogy?',
          'What is the most common mistake with the power rule?',
          'Give me a step-by-step example of differentiating (3x+1)^5',
          'What are the prerequisite skills I need for product rule?',
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={sending}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              color: 'var(--text-secondary)',
              fontSize: '0.78rem',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Input Bar */}
      <div className="glass-panel" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Ask the tutor in ${mode.replace('_', ' ')} mode...`}
          disabled={sending}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '0.95rem',
            padding: '10px 14px',
            outline: 'none',
          }}
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || sending}
          className="btn btn-primary"
          style={{ padding: '10px 18px', borderRadius: 'var(--radius-md)' }}
        >
          <Send size={16} />
          {sending ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  );
};
