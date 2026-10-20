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

  // On load: auto-login as demo (works with real backend or mock data)
  const refreshUser = async () => {
    try {
      // api.getMe() returns mock DEMO_USER when backend is unavailable
      const currentUser = await api.getMe();
      setUser(currentUser);
    } catch {
      const res = await api.demoLogin();
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshUser(); }, []);

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
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

