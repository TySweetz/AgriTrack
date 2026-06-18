import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, AuthUser } from '../api/auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    nom: string;
    role?: 'agriculteur' | 'acheteur';
    telephone?: string;
    adresse?: string;
  }) => Promise<void>;
  logout: () => void;
  updateMe: (data: { nom?: string; telephone?: string; adresse?: string; pseudo?: string }) => Promise<void>;
  switchRole: (role: 'agriculteur' | 'acheteur') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const persistAuth = (token: string, userData: AuthUser) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    persistAuth(res.data.access_token, res.data.user);
  };

  const register = async (data: Parameters<typeof authApi.register>[0]) => {
    const res = await authApi.register(data);
    persistAuth(res.data.access_token, res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateMe = async (data: { nom?: string; telephone?: string; adresse?: string; pseudo?: string }) => {
    const res = await authApi.updateMe(data);
    persistAuth(res.data.access_token, res.data.user);
  };

  const switchRole = async (role: 'agriculteur' | 'acheteur') => {
    const res = await authApi.switchRole(role);
    persistAuth(res.data.access_token, res.data.user);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateMe, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
