import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.ts';
import { authApi, tokenStorage } from '../lib/api.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (params: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: 'customer' | 'salon_owner';
  }) => Promise<void>;
  demoLogin: (role: 'customer' | 'salon_owner' | 'admin', email?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    const token = tokenStorage.get();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await authApi.getMe();
      setUser(data.user);
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      tokenStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setUser(res.user);
  };

  const register = async (params: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: 'customer' | 'salon_owner';
  }) => {
    const res = await authApi.register(params);
    setUser(res.user);
  };

  const demoLogin = async (role: 'customer' | 'salon_owner' | 'admin', email?: string) => {
    setLoading(true);
    try {
      const res = await authApi.demoLogin(role, email);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        demoLogin,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
