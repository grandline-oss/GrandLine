'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from './types';

import { checkRateLimit, recordFailedAttempt, resetRateLimit } from './security';

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AUTH_STORAGE_KEY = 'tapsh_restaurant_admin_auth_v1';
const SESSION_COOKIE_NAME = 'grandline_admin_session';

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
        // Keep session cookie synchronized
        document.cookie = `${SESSION_COOKIE_NAME}=active; Path=/; SameSite=Lax`;
      }
    } catch (e) {
      console.error('Failed to parse auth token', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    // 1. Enforce brute-force attack rate limiting (Rule 10)
    const rateCheck = checkRateLimit('admin_login', 5, 5 * 60 * 1000, 2 * 60 * 1000);
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `Too many failed attempts. Please wait ${rateCheck.waitSeconds} seconds before trying again.`,
      };
    }

    const cleanEmail = email.trim().toLowerCase();
    
    const customCreds = localStorage.getItem('tapsh_admin_creds');
    let validEmail = 'admin@grandline.com';
    let validPass = 'admin123';

    if (customCreds) {
      try {
        const parsed = JSON.parse(customCreds);
        if (parsed.email) validEmail = parsed.email.toLowerCase();
        if (parsed.password) validPass = parsed.password;
      } catch (err) {
        console.error('Credential check error:', err);
      }
    }

    if (cleanEmail === validEmail && pass === validPass) {
      resetRateLimit('admin_login');
      const authUser: AdminUser = {
        id: 'user_admin_01',
        email: cleanEmail,
        name: 'Restaurant Administrator',
        role: 'admin',
      };
      setUser(authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      // Set session cookie with SameSite protection
      document.cookie = `${SESSION_COOKIE_NAME}=active; Path=/; SameSite=Lax`;
      return { success: true };
    }

    const failure = recordFailedAttempt('admin_login', 5, 2 * 60 * 1000);
    if (failure.locked) {
      return {
        success: false,
        error: `Account locked due to consecutive failed attempts. Wait ${failure.waitSeconds}s.`,
      };
    }

    return { success: false, error: 'Invalid email address or password. Please try again.' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // Clear session cookie
    document.cookie = `${SESSION_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
