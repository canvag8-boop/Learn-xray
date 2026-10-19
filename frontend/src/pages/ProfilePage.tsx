import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardData } from '../types';
import { 
  User as UserIcon, 
  Mail, 
  GraduationCap, 
  Target, 
  Save, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Clock, 
  Calendar,
  AlertCircle
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [grade, setGrade] = useState(user?.grade || 'JEE Aspirant');
  const [learningGoal, setLearningGoal] = useState(user?.learning_goal || 'Master Differentiation');
  
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || '');
      setGrade(user.grade || 'JEE Aspirant');
      setLearningGoal(user.learning_goal || 'Master Differentiation');
    }
    
    // Fetch stats
    api.getDashboard()
      .then(data => setDashboardData(data))
      .catch(err => console.error('Failed to load dashboard profile stats:', err));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setLoading(true);

    try {
      await api.updateProfile({
        display_name: displayName,
        grade: grade,
        learning_goal: learningGoal,
      });
      await refreshUser();
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', color: '#a5b4fc', fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px' }}>
          <UserIcon size={14} /> Student Profile & Identity
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Account <span className="gradient-text">Settings</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '6px' }}>
          Manage your personal learning profile, target examination goals, and study tracking.
        </p>
      </div>

      {successMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', color: '#10b981', marginBottom: '24px' }}>
          <CheckCircle2 size={18} />
          <span style={{ fontWeight: 600 }}>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#f87171', marginBottom: '24px' }}>
          <AlertCircle size={18} />
          <span style={{ fontWeight: 600 }}>{errorMessage}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
        {/* Left Column: Edit Profile */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#fff',
              boxShadow: '0 0 20px rgba(0, 242, 254, 0.3)',
            }}>
              {user?.display_name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{user?.display_name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <Mail size={13} /> {user?.email}
              </div>
              {user?.is_demo && (
                <div style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontWeight: 700 }}>
                  DEMO ACCOUNT ACTIVE
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Display Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Academic Target / Grade
              </label>
              <select
                className="input-field"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="JEE Main & Advanced 2025">JEE Main & Advanced 2025</option>
                <option value="JEE Main & Advanced 2026">JEE Main & Advanced 2026</option>
                <option value="Class 12 - Calculus Specialist">Class 12 - Calculus Specialist</option>
                <option value="Class 11 - Early Foundation">Class 11 - Early Foundation</option>
                <option value="College Undergraduate">College Undergraduate</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Primary Learning Goal
              </label>
              <input
                type="text"
                className="input-field"
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                placeholder="e.g. Master Chain Rule & JEE Differentiation"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Username (Immutable)
              </label>
              <input
                type="text"
                className="input-field"
                value={user?.username || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed', background: 'rgba(0, 0, 0, 0.2)' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ marginTop: '10px', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Save size={16} />
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Right Column: Learning Metrics & Account Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Metrics */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="#00f2fe" />
              Calculus Diagnostic Summary
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Concepts Mastered
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                  {dashboardData?.stats?.mastered_concepts ?? 0}
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {' '}/ {dashboardData ? (dashboardData.stats.mastered_concepts + dashboardData.stats.developing_concepts + dashboardData.stats.concepts_needing_practice + dashboardData.stats.unassessed_concepts) : 10}
                  </span>
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Average Accuracy
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#00f2fe', marginTop: '4px' }}>
                  {dashboardData?.stats?.accuracy_percentage ?? 0}%
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Developing Concepts
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
                  {dashboardData?.stats?.developing_concepts ?? 0}
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Questions Attempted
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a855f7', marginTop: '4px' }}>
                  {dashboardData?.stats?.questions_attempted ?? 0}
                </div>
              </div>
            </div>
          </div>

          {/* Account Security & Storage Card */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#10b981" />
              Security & Session Status
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={15} color="#10b981" />
                <span>JWT Authentication: <strong>HTTP-Only Cookie + Bearer Token</strong></span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={15} color="#10b981" />
                <span>Password Protection: <strong>Bcrypt Salted Hash</strong></span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={15} color="#10b981" />
                <span>Role & Tier: <strong>Student (Full Misconception Access)</strong></span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
