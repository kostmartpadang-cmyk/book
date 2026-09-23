'use client';

import { Lock } from 'lucide-react';

interface ComplaintCardProps {
  author: string;
  content: string;
  isPublished: boolean;
  isOwner: boolean;
  onClick: () => void;
}

export default function ComplaintCard({ author, content, isPublished, isOwner, onClick }: ComplaintCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full text-left p-5 rounded-card shadow-card bg-elevated border border-border hover:border-primary/50 hover:-translate-y-1 transition-all duration-300"
    >
      <p className="font-body text-sm text-ink leading-relaxed line-clamp-5 whitespace-pre-line">{content}</p>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <span className="text-xs text-ink-muted truncate">{author}</span>
        {isOwner && !isPublished && (
          <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-hover text-ink-muted border border-border flex items-center gap-1">
            <Lock size={9} /> Cuma untukku
          </span>
        )}
      </div>
    </button>
  );
}
