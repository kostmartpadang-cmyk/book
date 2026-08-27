'use client';

import { useState } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface EditProfileModalProps {
  onClose: () => void;
}

export default function EditProfileModal({ onClose }: EditProfileModalProps) {
  const { user, updateDisplayName } = useAuth();
  const [name, setName] = useState((user?.user_metadata?.display_name as string) || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) {
      setError('Nama tidak boleh kosong.');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await updateDisplayName(name);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-10 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm my-8 bg-elevated border border-border rounded-card shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-bold text-ink">Edit Profil</h3>
          <button onClick={onClose} className="text-ink-muted hover:text-ink" aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        <label className="block text-sm font-medium text-ink-muted mb-2">Nama Penulis</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama tampilan..."
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          autoFocus
          className="w-full p-3 mb-4 bg-canvas border border-border rounded-btn text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <p className="text-xs text-ink-muted mb-4">
          Nama ini tampil sebagai nama penulis di semua cerita &amp; puisi kamu.
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary-strong flex justify-center items-center gap-2 text-white rounded-btn font-medium transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Simpan
        </button>
      </div>
    </div>
  );
}
