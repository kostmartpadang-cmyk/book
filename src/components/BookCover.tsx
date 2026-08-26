'use client';

interface BookCoverProps {
  title: string;
  date: string;
  author: string;
  theme: string;
  coverUrl?: string | null;
  onClick: () => void;
}

export default function BookCover({ title, date, author, theme, coverUrl, onClick }: BookCoverProps) {
  return (
    <button
      data-theme={theme}
      onClick={onClick}
      className="group relative w-32 sm:w-36 h-44 sm:h-48 shrink-0 rounded-r-lg rounded-l-sm bg-primary-strong shadow-card overflow-hidden text-left hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
    >
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute top-3 left-4 right-3 text-[9px] uppercase tracking-wide text-white/75 font-semibold">
          Ruang Cerita
        </div>
      )}
      <div className="absolute inset-y-0 left-0 w-1.5 bg-black/25" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      <div className="absolute bottom-0 inset-x-0 bg-black/40 pl-4 pr-3 py-2.5">
        <p className="font-heading text-xs font-bold leading-snug line-clamp-3 text-white">{title}</p>
        <p className="text-[10px] text-white/80 truncate">{author}</p>
        <span className="text-[10px] text-white/70">{date}</span>
      </div>
    </button>
  );
}
