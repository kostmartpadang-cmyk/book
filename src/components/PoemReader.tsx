'use client';

import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { DEFAULT_THEME } from '@/lib/themes';

interface PoemReaderProps {
  title: string;
  content: string | null;
  imageUrl: string | null;
  theme?: string;
  isOwner?: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function PoemReader({
  title,
  content,
  imageUrl,
  theme = DEFAULT_THEME,
  isOwner = false,
  onBack,
  onEdit,
  onDelete,
}: PoemReaderProps) {
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
            <button
              onClick={onEdit}
              className="p-2 rounded-btn text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors"
              aria-label="Edit puisi"
            >
              <Pencil size={18} />
            </button>
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

      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-ink text-left mb-8">{title}</h1>

      {imageUrl ? (
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={title} className="max-w-full rounded-card shadow-card" />
        </div>
      ) : (
        <p className="font-body text-base sm:text-lg leading-relaxed text-left whitespace-pre-line">
          {content}
        </p>
      )}
    </div>
  );
}
