'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  authHeader: () => Record<string, string>;
  updateDisplayName: (name: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  signUp: async () => ({ error: 'Belum siap' }),
  signIn: async () => ({ error: 'Belum siap' }),
  signOut: async () => {},
  authHeader: () => ({}),
  updateDisplayName: async () => ({ error: 'Belum siap' }),
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!supabase) return { error: 'Supabase belum dikonfigurasi' };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    return { error: error?.message || null };
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase belum dikonfigurasi' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const authHeader = () => {
    const headers: Record<string, string> = {};
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
    return headers;
  };

  // Updates both the public "profiles" row (used for author attribution on
  // stories/poems) and the auth user_metadata (so the sidebar reflects the
  // new name immediately via the onAuthStateChange listener above).
  const updateDisplayName = async (name: string) => {
    if (!supabase) return { error: 'Supabase belum dikonfigurasi' };
    const trimmed = name.trim();
    if (!trimmed) return { error: 'Nama tidak boleh kosong' };

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ display_name: trimmed }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Gagal menyimpan nama' };

    const { error } = await supabase.auth.updateUser({ data: { display_name: trimmed } });
    return { error: error?.message || null };
  };

  return (
    <AuthContext.Provider
      value={{ user: session?.user ?? null, session, loading, signUp, signIn, signOut, authHeader, updateDisplayName }}
    >
      {children}
    </AuthContext.Provider>
  );
}
