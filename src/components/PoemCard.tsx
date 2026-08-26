'use client';

interface PoemCardProps {
  title: string;
  content: string | null;
  imageUrl: string | null;
  theme: string;
  onClick: () => void;
}

export default function PoemCard({ title, content, imageUrl, theme, onClick }: PoemCardProps) {
  return (
    <button
      data-theme={theme}
      onClick={onClick}
      className="group relative w-40 sm:w-44 h-52 sm:h-56 shrink-0 rounded-card shadow-card overflow-hidden text-left hover:-translate-y-2 hover:shadow-xl transition-all duration-300 bg-elevated border border-border"
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <p className="font-heading italic text-sm text-ink-muted text-center leading-relaxed line-clamp-6 whitespace-pre-line">
            {content}
          </p>
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      <div className={`absolute bottom-0 inset-x-0 px-3 py-2.5 ${imageUrl ? 'bg-black/45' : 'bg-primary-soft border-t border-border'}`}>
        <p className={`font-heading text-xs font-bold leading-snug line-clamp-2 ${imageUrl ? 'text-white' : 'text-primary-strong'}`}>
          {title}
        </p>
      </div>
    </button>
  );
}
