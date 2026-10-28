'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient, setAccessToken, getAccessToken } from '../lib/api';

export type AdminRole = 'SUPER_ADMIN' | 'MANAGER' | 'STAFF';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: AdminRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        if (pathname && !pathname.includes('/login')) {
          router.push('/login');
        }
        return;
      }

      try {
        const res = await apiClient.get('/admin/auth/me');
        setUser(res.data.data);
      } catch {
        setAccessToken(null);
        setUser(null);
        if (pathname && !pathname.includes('/login')) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [pathname, router]);

  const login = async (email: string, pass: string) => {
    const res = await apiClient.post('/admin/auth/login', { email, password: pass });
    const { user: loggedInUser, accessToken } = res.data.data;
    setAccessToken(accessToken);
    setUser(loggedInUser);
    router.push('/');
  };

  const logout = async () => {
    try {
      await apiClient.post('/admin/auth/logout');
    } catch {
      // Ignore error during logout
    } finally {
      setAccessToken(null);
      setUser(null);
      router.push('/login');
    }
  };

  const hasRole = (...roles: AdminRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
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
