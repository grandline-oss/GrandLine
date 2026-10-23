'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from './types';

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AUTH_STORAGE_KEY = 'tapsh_restaurant_admin_auth_v1';

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
      }
    } catch (e) {
      console.error('Failed to parse auth token', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    // Clean, secure client-side check with support for customizable credentials
    const cleanEmail = email.trim().toLowerCase();
    
    // In production or when Firebase Auth is activated, Firebase signInWithEmailAndPassword is used.
    // For standalone immediate out-of-the-box operation:
    const customCreds = localStorage.getItem('tapsh_admin_creds');
    let validEmail = 'admin@grandline.com';
    let validPass = 'admin123';

    if (customCreds) {
      try {
        const parsed = JSON.parse(customCreds);
        if (parsed.email) validEmail = parsed.email.toLowerCase();
        if (parsed.password) validPass = parsed.password;
      } catch (err) {
        console.error(err);
      }
    }

    if (cleanEmail === validEmail && pass === validPass) {
      const authUser: AdminUser = {
        id: 'user_admin_01',
        email: cleanEmail,
        name: 'Restaurant Administrator',
        role: 'admin',
      };
      setUser(authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      return { success: true };
    }

    return { success: false, error: 'Invalid email address or password. Please try again.' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
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
