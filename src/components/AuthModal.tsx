'use client';

import { useState } from 'react';
import { X, Loader2, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Email dan password wajib diisi.');
      return;
    }
    setLoading(true);
    setError(null);
    setInfo(null);

    const result = mode === 'signin' ? await signIn(email, password) : await signUp(email, password, displayName);

    if (result.error) {
      setError(result.error);
    } else if (mode === 'signup') {
      setInfo('Akun berhasil dibuat. Cek email kamu jika diminta verifikasi, lalu masuk.');
      setMode('signin');
    } else {
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-10 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm my-8 bg-elevated border border-border rounded-card shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-bold text-ink">
            {mode === 'signin' ? 'Masuk' : 'Buat Akun'}
          </h3>
          <button onClick={onClose} className="text-ink-muted hover:text-ink" aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-1 mb-5 bg-surface border border-border rounded-btn p-1">
          <button
            onClick={() => { setMode('signin'); setError(null); setInfo(null); }}
            className={`flex-1 py-2 rounded-[calc(var(--radius-btn)-4px)] text-sm font-medium transition-colors ${
              mode === 'signin' ? 'bg-primary-soft text-primary-strong' : 'text-ink-muted'
            }`}
          >
            Masuk
          </button>
          <button
            onClick={() => { setMode('signup'); setError(null); setInfo(null); }}
            className={`flex-1 py-2 rounded-[calc(var(--radius-btn)-4px)] text-sm font-medium transition-colors ${
              mode === 'signup' ? 'bg-primary-soft text-primary-strong' : 'text-ink-muted'
            }`}
          >
            Daftar
          </button>
        </div>

        {mode === 'signup' && (
          <>
            <label className="block text-sm font-medium text-ink-muted mb-2">Nama</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nama tampilan..."
              className="w-full p-3 mb-4 bg-canvas border border-border rounded-btn text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </>
        )}

        <label className="block text-sm font-medium text-ink-muted mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="kamu@email.com"
          className="w-full p-3 mb-4 bg-canvas border border-border rounded-btn text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
        />

        <label className="block text-sm font-medium text-ink-muted mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="w-full p-3 mb-4 bg-canvas border border-border rounded-btn text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {info && <p className="text-primary-strong text-sm mb-4">{info}</p>}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary-strong flex justify-center items-center gap-2 text-white rounded-btn font-medium transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : mode === 'signin' ? (
            <LogIn size={18} />
          ) : (
            <UserPlus size={18} />
          )}
          {mode === 'signin' ? 'Masuk' : 'Daftar'}
        </button>
      </div>
    </div>
  );
}
