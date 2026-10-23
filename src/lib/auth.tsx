'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from './types';
import { auth } from './firebase';
import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from './security';

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AUTHORIZED_ADMIN_EMAIL = 'grandlinecaferestaurant@gmail.com';
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

  // Synchronize Firebase Auth state with local session
  useEffect(() => {
    let unsubscribe = () => {};

    if (auth) {
      unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser && fbUser.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL) {
          const authUser: AdminUser = {
            id: fbUser.uid,
            email: AUTHORIZED_ADMIN_EMAIL,
            name: 'GrandLine Owner',
            role: 'admin',
          };
          setUser(authUser);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
          document.cookie = `${SESSION_COOKIE_NAME}=active; Path=/; SameSite=Lax`;
          setLoading(false);
          return;
        }

        // If not authenticated via Firebase, check cached local session
        try {
          const stored = localStorage.getItem(AUTH_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL) {
              setUser(parsed);
              document.cookie = `${SESSION_COOKIE_NAME}=active; Path=/; SameSite=Lax`;
            } else {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        } finally {
          setLoading(false);
        }
      });
    } else {
      // Offline fallback
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL) {
            setUser(parsed);
            document.cookie = `${SESSION_COOKIE_NAME}=active; Path=/; SameSite=Lax`;
          }
        }
      } catch (e) {
        console.error('Failed to parse auth token', e);
      } finally {
        setLoading(false);
      }
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    // 1. Rate limiting check
    const rateCheck = checkRateLimit('admin_login', 5, 5 * 60 * 1000, 2 * 60 * 1000);
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `Too many failed attempts. Please wait ${rateCheck.waitSeconds} seconds before trying again.`,
      };
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. STRICT AUTHORIZATION ENFORCEMENT
    // Only grandlinecaferestaurant@gmail.com is permitted
    if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL) {
      recordFailedAttempt('admin_login', 5, 2 * 60 * 1000);
      return {
        success: false,
        error: `Access Denied: Only ${AUTHORIZED_ADMIN_EMAIL} is authorized to access this administration portal.`,
      };
    }

    // 3. Authenticate with Firebase Authentication
    if (auth) {
      try {
        const credential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        if (credential.user && credential.user.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL) {
          resetRateLimit('admin_login');
          const authUser: AdminUser = {
            id: credential.user.uid,
            email: AUTHORIZED_ADMIN_EMAIL,
            name: 'GrandLine Owner',
            role: 'admin',
          };
          setUser(authUser);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
          document.cookie = `${SESSION_COOKIE_NAME}=active; Path=/; SameSite=Lax`;
          return { success: true };
        }
      } catch (err: unknown) {
        const failure = recordFailedAttempt('admin_login', 5, 2 * 60 * 1000);
        if (failure.locked) {
          return {
            success: false,
            error: `Account locked due to consecutive failed attempts. Wait ${failure.waitSeconds}s.`,
          };
        }

        const fbError = err as { code?: string; message?: string };
        if (fbError.code === 'auth/invalid-credential' || fbError.code === 'auth/wrong-password') {
          return {
            success: false,
            error: 'Incorrect password for grandlinecaferestaurant@gmail.com. Please try again.',
          };
        }
        if (fbError.code === 'auth/user-not-found') {
          return {
            success: false,
            error: `User not found in Firebase Authentication for ${AUTHORIZED_ADMIN_EMAIL}.`,
          };
        }
        if (fbError.code === 'auth/too-many-requests') {
          return {
            success: false,
            error: 'Access temporarily disabled due to too many failed requests. Try again later.',
          };
        }
      }
    }

    // 4. Local emergency credentials fallback (must match authorized email)
    const customCreds = localStorage.getItem('tapsh_admin_creds');
    let validPass = 'admin123';
    if (customCreds) {
      try {
        const parsed = JSON.parse(customCreds);
        if (parsed.password) validPass = parsed.password;
      } catch {
        // ignore
      }
    }

    if (pass === validPass) {
      resetRateLimit('admin_login');
      const authUser: AdminUser = {
        id: 'user_admin_01',
        email: AUTHORIZED_ADMIN_EMAIL,
        name: 'GrandLine Owner',
        role: 'admin',
      };
      setUser(authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      document.cookie = `${SESSION_COOKIE_NAME}=active; Path=/; SameSite=Lax`;
      return { success: true };
    }

    const failure = recordFailedAttempt('admin_login', 5, 2 * 60 * 1000);
    return {
      success: false,
      error: failure.locked
        ? `Account locked due to consecutive failed attempts. Wait ${failure.waitSeconds}s.`
        : 'Invalid credentials. Please verify your password.',
    };
  };

  const logout = () => {
    if (auth) {
      fbSignOut(auth).catch(() => {});
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
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
