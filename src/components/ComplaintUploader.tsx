'use client';

import { useState } from 'react';
import { Save, Loader2, Globe, Lock } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface ComplaintUploaderProps {
  onSaved: (id: string) => void;
}

export default function ComplaintUploader({ onSaved }: ComplaintUploaderProps) {
  const { user, authHeader } = useAuth();
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 bg-surface backdrop-blur-xl rounded-card border border-border shadow-card font-body text-center">
        <p className="text-ink font-semibold mb-1">Kamu harus masuk dulu</p>
        <p className="text-ink-muted text-sm">Silakan masuk atau buat akun lewat sidebar untuk curhat.</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('Isi keluh kesahmu dulu ya.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ content, is_published: isPublished }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan keluh kesah');
      onSaved(data.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-surface backdrop-blur-xl rounded-card border border-border shadow-card font-body">
      <h2 className="font-heading text-lg font-bold text-ink mb-1">Keluh Kesah</h2>
      <p className="text-ink-muted text-sm mb-6">Tempat curhat. Boleh disimpan sendiri, boleh dibagikan.</p>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Lagi kepikiran apa hari ini?"
        className="w-full h-64 p-5 bg-elevated border border-border rounded-btn text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none shadow-inner mb-6"
      />

      <label className="block text-sm font-bold text-ink mb-2">Status</label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setIsPublished(false)}
          className={`flex items-center gap-2 p-3 rounded-btn border text-left transition-all ${
            !isPublished ? 'border-primary bg-primary-soft ring-1 ring-primary' : 'border-border bg-elevated hover:bg-surface-hover'
          }`}
        >
          <Lock size={16} className="text-primary shrink-0" />
          <div>
            <div className="text-xs font-semibold text-ink">Cuma untukku</div>
            <div className="text-[11px] text-ink-muted">Tidak ada yang bisa lihat</div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setIsPublished(true)}
          className={`flex items-center gap-2 p-3 rounded-btn border text-left transition-all ${
            isPublished ? 'border-primary bg-primary-soft ring-1 ring-primary' : 'border-border bg-elevated hover:bg-surface-hover'
          }`}
        >
          <Globe size={16} className="text-primary shrink-0" />
          <div>
            <div className="text-xs font-semibold text-ink">Bagikan</div>
            <div className="text-[11px] text-ink-muted">Terlihat semua orang</div>
          </div>
        </button>
      </div>

      {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-btn mt-4">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={isProcessing}
        className="w-full mt-6 py-4 bg-primary hover:bg-primary-strong flex justify-center items-center gap-2 text-white rounded-btn font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-card"
      >
        {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
        Simpan
      </button>
    </div>
  );
}
