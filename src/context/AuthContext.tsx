import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type UserRole = 'farmer' | 'officer' | 'collector' | 'researcher' | 'student';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole | null;
  email_confirmed: boolean;
}

interface AuthContextValue {
  user: Profile | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (data: { email: string; password: string; full_name: string; phone: string; role: UserRole }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  resendConfirmation: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (data: Partial<Pick<Profile, 'full_name' | 'phone' | 'role'>>) => Promise<{ error: string | null }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string, email: string): Promise<Profile | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
    if (data) {
      return { ...data, email };
    }
    // Profile row doesn't exist yet — create a minimal one from metadata
    return { id: userId, email, full_name: null, phone: null, role: null, email_confirmed: false };
  }, []);

  const refreshUser = useCallback(async () => {
    if (!supabase) return;
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) {
      setUser(null);
      return;
    }
    const authUser = sessionData.session.user;
    const profile = await fetchProfile(authUser.id, authUser.email || '');
    if (profile) {
      setUser({
        ...profile,
        email_confirmed: Boolean(authUser.email_confirmed_at),
      });
    }
  }, [fetchProfile]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Initial session check
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        const profile = await fetchProfile(sessionData.session.user.id, sessionData.session.user.email || '');
        if (profile) {
          setUser({
            ...profile,
            email_confirmed: Boolean(sessionData.session.user.email_confirmed_at),
          });
        }
      }
      setLoading(false);
    })();

    // onAuthStateChange — wrap async in IIFE to avoid deadlock
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id, session.user.email || '');
          if (profile) {
            setUser({
              ...profile,
              email_confirmed: Boolean(session.user.email_confirmed_at),
            });
          }
        } else {
          setUser(null);
        }
      })();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Demo mode: Supabase not configured' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }, []);

  const signUp = useCallback(
    async (data: { email: string; password: string; full_name: string; phone: string; role: UserRole }) => {
      if (!supabase) return { error: 'Demo mode: Supabase not configured' };
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            phone: data.phone,
            role: data.role,
          },
        },
      });
      if (error) return { error: error.message };
      // Insert profile row
      if (signUpData.user) {
        await supabase.from('profiles').insert({
          id: signUpData.user.id,
          email: data.email,
          full_name: data.full_name,
          phone: data.phone,
          role: data.role,
        });
      }
      return { error: null };
    },
    [],
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) return { error: 'Demo mode: Supabase not configured' };
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error?.message || null };
  }, []);

  const resendConfirmation = useCallback(async (email: string) => {
    if (!supabase) return { error: 'Demo mode: Supabase not configured' };
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    return { error: error?.message || null };
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<Pick<Profile, 'full_name' | 'phone' | 'role'>>) => {
      if (!supabase || !user) return { error: 'Not signed in' };
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
      if (error) return { error: error.message };
      await refreshUser();
      return { error: null };
    },
    [user, refreshUser],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoMode: !isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        resendConfirmation,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
