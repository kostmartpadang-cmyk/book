'use client';

import { useRef, useState } from 'react';
import { ArrowLeft, Trash2, Save, Loader2, Globe, Lock } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface ComplaintReaderProps {
  complaintId: string;
  author?: string;
  content: string;
  isPublished: boolean;
  isOwner?: boolean;
  onBack: () => void;
  onDelete: () => void;
  onSaved: () => void;
}

export default function ComplaintReader({
  complaintId,
  author,
  content,
  isPublished,
  isOwner = false,
  onBack,
  onDelete,
  onSaved,
}: ComplaintReaderProps) {
  const { authHeader } = useAuth();
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [published, setPublished] = useState(isPublished);

  const save = async (updates: { content?: string; is_published?: boolean }) => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan perubahan');
      onSaved();
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveInline = () => {
    const newContent = (contentRef.current?.innerText || '').trim();
    if (!newContent) {
      setSaveError('Isi keluh kesah tidak boleh kosong.');
      return;
    }
    save({ content: newContent });
  };

  const togglePublish = () => {
    const next = !published;
    setPublished(next);
    save({ is_published: next });
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative bg-elevated min-h-screen text-ink p-6 sm:p-10 md:p-14 shadow-card rounded-card">
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-elevated/90 backdrop-blur py-3 sm:py-4 z-10 border-b border-border -mx-6 sm:-mx-10 md:-mx-14 px-6 sm:px-10 md:px-14">
        <button onClick={onBack} className="flex items-center gap-2 text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft size={20} /> Kembali
        </button>

        {isOwner && (
          <div className="flex items-center gap-1">
            <button
              onClick={togglePublish}
              disabled={saving}
              className="flex items-center gap-2 text-xs font-medium text-ink-muted hover:text-ink px-2.5 py-2 rounded-btn hover:bg-surface-hover transition-colors disabled:opacity-50"
            >
              {published ? <Globe size={14} /> : <Lock size={14} />}
              {published ? 'Dibagikan' : 'Cuma untukku'}
            </button>
            <button
              onClick={saveInline}
              disabled={saving}
              className="flex items-center gap-2 text-sm font-medium text-white bg-primary hover:bg-primary-strong px-3 py-2 rounded-btn transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Simpan
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-btn text-red-500 hover:bg-red-500/10 transition-colors"
              aria-label="Hapus"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {saveError && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-btn">{saveError}</p>}

      {author && <p className="text-sm text-ink-muted mb-6">{author}</p>}

      <p
        ref={contentRef}
        contentEditable={isOwner}
        suppressContentEditableWarning
        className={`font-body text-base sm:text-lg leading-relaxed text-left whitespace-pre-line ${
          isOwner ? 'focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-btn -mx-1 px-1 min-h-[3em]' : ''
        }`}
      >
        {content}
      </p>

      {isOwner && <p className="text-xs text-ink-muted mt-6">Klik isi di atas untuk mengedit langsung.</p>}
    </div>
  );
}
