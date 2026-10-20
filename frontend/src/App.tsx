import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { KnowledgeGraphPage } from './pages/KnowledgeGraphPage';
import { TutorPage } from './pages/TutorPage';
import { LearningPathPage } from './pages/LearningPathPage';
import { ProgressPage } from './pages/ProgressPage';
import { ProfilePage } from './pages/ProfilePage';
import { TimelinePage } from './pages/TimelinePage';
import { HackathonDemoBar } from './components/HackathonDemoBar';


// Footer Component
const Footer: React.FC = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      background: 'rgba(6, 9, 16, 0.95)',
      padding: '40px 24px',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
      }}>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
            Learn<span className="gradient-text">X-Ray</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            "Don't just learn the answer. Discover what's stopping you from understanding it."
          </p>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Built for JEE Mathematics • Calculus Misconception Engine • Demo Active
        </div>
      </div>
    </footer>
  );
};

export function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Redirect root to dashboard — no login needed */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* All routes are publicly accessible */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/assessment" element={<AssessmentPage />} />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/graph" element={<KnowledgeGraphPage />} />
              <Route path="/tutor" element={<TutorPage />} />
              <Route path="/path" element={<LearningPathPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
          <HackathonDemoBar />
          <Footer />
        </div>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
