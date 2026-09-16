import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  hasRole: (...allowedRoles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('hv_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed?.role) {
        parsed.role = parsed.role.toLowerCase() as UserRole;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('hv_token');
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function verifyAuth() {
      if (token) {
        try {
          const res = await api.getMe();
          if (isMounted && res?.user) {
            const normalizedUser: User = {
              ...res.user,
              role: res.user.role.toLowerCase() as UserRole,
            };
            setUser(normalizedUser);
            localStorage.setItem('hv_user', JSON.stringify(normalizedUser));
          }
        } catch (e) {
          // In offline or cloud demo environments, retain the local user session
          const saved = localStorage.getItem('hv_user');
          if (!saved && isMounted) {
            logout();
          }
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    }

    verifyAuth();

    const handleAuthLogout = () => logout();
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => {
      isMounted = false;
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, [token]);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.login(credentials);
    const normalizedUser: User = {
      ...res.user,
      role: res.user.role.toLowerCase() as UserRole,
    };
    setUser(normalizedUser);
    setToken(res.token);
    localStorage.setItem('hv_token', res.token);
    localStorage.setItem('hv_user', JSON.stringify(normalizedUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hv_token');
    localStorage.removeItem('hv_user');
  };

  const hasRole = (...allowedRoles: string[]): boolean => {
    if (!user || !user.role) return false;
    const userRoleLower = user.role.toLowerCase();
    return allowedRoles.map((r) => r.toLowerCase()).includes(userRoleLower);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
