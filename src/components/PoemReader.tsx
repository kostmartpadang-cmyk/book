'use client';

import { useRef, useState } from 'react';
import { ArrowLeft, Pencil, Trash2, Save, Loader2 } from 'lucide-react';
import { DEFAULT_THEME } from '@/lib/themes';
import { useAuth } from './AuthProvider';
import CommentSection from './CommentSection';

interface PoemReaderProps {
  poemId: string;
  title: string;
  author?: string;
  content: string | null;
  imageUrl: string | null;
  theme?: string;
  isOwner?: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSaved: () => void;
}

export default function PoemReader({
  poemId,
  title,
  author,
  content,
  imageUrl,
  theme = DEFAULT_THEME,
  isOwner = false,
  onBack,
  onEdit,
  onDelete,
  onSaved,
}: PoemReaderProps) {
  const { authHeader } = useAuth();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const canInlineEdit = isOwner && !imageUrl;

  const saveInline = async () => {
    const newTitle = (titleRef.current?.innerText || '').trim();
    const newContent = (contentRef.current?.innerText || '').trim();

    if (!newTitle) {
      setSaveError('Judul tidak boleh kosong.');
      return;
    }
    if (!newContent) {
      setSaveError('Isi puisi tidak boleh kosong.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/poems/${poemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ title: newTitle, content: newContent }),
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

  return (
    <div
      data-theme={theme}
      className="w-full max-w-3xl mx-auto relative bg-elevated min-h-screen text-ink p-6 sm:p-10 md:p-14 shadow-card rounded-card"
    >
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-elevated/90 backdrop-blur py-3 sm:py-4 z-10 border-b border-border -mx-6 sm:-mx-10 md:-mx-14 px-6 sm:px-10 md:px-14">
        <button onClick={onBack} className="flex items-center gap-2 text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft size={20} /> Kembali
        </button>

        {isOwner && (
          <div className="flex items-center gap-1">
            {canInlineEdit ? (
              <button
                onClick={saveInline}
                disabled={saving}
                className="flex items-center gap-2 text-sm font-medium text-white bg-primary hover:bg-primary-strong px-3 py-2 rounded-btn transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Simpan
              </button>
            ) : (
              <button
                onClick={onEdit}
                className="p-2 rounded-btn text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors"
                aria-label="Edit puisi"
              >
                <Pencil size={18} />
              </button>
            )}
            <button
              onClick={onDelete}
              className="p-2 rounded-btn text-red-500 hover:bg-red-500/10 transition-colors"
              aria-label="Hapus puisi"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {saveError && (
        <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-btn">{saveError}</p>
      )}

      <h1
        ref={titleRef}
        contentEditable={canInlineEdit}
        suppressContentEditableWarning
        className={`font-heading text-2xl sm:text-3xl font-bold text-ink text-left mb-2 ${
          canInlineEdit ? 'focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-btn -mx-1 px-1' : ''
        }`}
      >
        {title}
      </h1>
      {author && <p className="text-sm text-ink-muted mb-8">Ditulis oleh {author}</p>}

      {imageUrl ? (
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={title} className="max-w-full rounded-card shadow-card" />
        </div>
      ) : (
        <p
          ref={contentRef}
          contentEditable={canInlineEdit}
          suppressContentEditableWarning
          className={`font-body text-base sm:text-lg leading-relaxed text-left whitespace-pre-line ${
            canInlineEdit ? 'focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-btn -mx-1 px-1 min-h-[3em]' : ''
          }`}
        >
          {content}
        </p>
      )}

      {canInlineEdit && (
        <p className="text-xs text-ink-muted mt-6">Klik judul atau isi di atas untuk mengedit langsung.</p>
      )}

      <CommentSection poemId={poemId} />
    </div>
  );
}
