import React, { createContext, useContext } from 'react';
import { User } from '../types';

// Static guest user — no login required, everyone can use the app
const GUEST_USER: User = {
  id: 1,
  username: 'guest',
  email: 'guest@learnxray.app',
  display_name: 'Guest Student',
  grade: 'JEE Aspirant',
  learning_goal: 'Master JEE Differentiation',
  is_demo: true,
  created_at: new Date().toISOString(),
};

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
  const noop = async () => {};

  return (
    <AuthContext.Provider value={{
      user: GUEST_USER,
      loading: false,
      login: noop,
      register: noop,
      demoLogin: noop,
      logout: noop,
      refreshUser: noop,
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
