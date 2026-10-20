import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: { email: string; username: string; display_name: string; password: string; grade?: string }) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Auto-login as demo on every app load — no password needed
  const autoLoginDemo = async () => {
    try {
      // If we already have a valid token, use it
      const currentUser = await api.getMe();
      setUser(currentUser);
    } catch {
      // No valid token — silently log in as demo user
      try {
        const res = await api.demoLogin();
        setUser(res.user);
      } catch {
        // Backend unavailable — use a placeholder so UI still renders
        setUser({
          id: 1,
          username: 'demo_student',
          email: 'demo@learnxray.app',
          display_name: 'Demo Student',
          grade: 'JEE Aspirant',
          learning_goal: 'Master JEE Differentiation',
          is_demo: true,
          created_at: new Date().toISOString(),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    autoLoginDemo();
  }, []);

  const refreshUser = async () => {
    try {
      const currentUser = await api.getMe();
      setUser(currentUser);
    } catch {
      await autoLoginDemo();
    }
  };

  const noop = async () => {};

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login: noop,
      register: noop,
      demoLogin: async () => {
        const res = await api.demoLogin();
        setUser(res.user);
      },
      logout: noop,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
