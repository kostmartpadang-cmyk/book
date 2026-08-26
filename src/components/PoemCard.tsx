'use client';

interface PoemCardProps {
  title: string;
  author: string;
  content: string | null;
  imageUrl: string | null;
  theme: string;
  onClick: () => void;
}

export default function PoemCard({ title, author, content, imageUrl, theme, onClick }: PoemCardProps) {
  return (
    <button
      data-theme={theme}
      onClick={onClick}
      className="group relative w-40 sm:w-44 h-52 sm:h-56 shrink-0 rounded-card shadow-card overflow-hidden text-left hover:-translate-y-2 hover:shadow-xl transition-all duration-300 bg-elevated border border-border"
    >
      {imageUrl ? (
        <div className="absolute inset-0 bg-surface-hover flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="w-full h-full object-contain" />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-start p-4">
          <p className="font-body text-sm text-ink-muted text-left leading-relaxed line-clamp-6 whitespace-pre-line">
            {content}
          </p>
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      <div className={`absolute bottom-0 inset-x-0 px-3 py-2.5 ${imageUrl ? 'bg-black/45' : 'bg-primary-soft border-t border-border'}`}>
        <p className={`font-heading text-xs font-bold leading-snug line-clamp-2 ${imageUrl ? 'text-white' : 'text-primary-strong'}`}>
          {title}
        </p>
        <p className={`text-[10px] truncate ${imageUrl ? 'text-white/80' : 'text-ink-muted'}`}>{author}</p>
      </div>
    </button>
  );
}
