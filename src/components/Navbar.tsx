'use client';

import { BookOpen, Search, Plus } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';

interface NavbarProps {
  query: string;
  onQueryChange: (q: string) => void;
  onNewStory: () => void;
}

export default function Navbar({ query, onQueryChange, onNewStory }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-surface backdrop-blur-lg border-b border-border">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-btn bg-primary text-white flex items-center justify-center">
            <BookOpen size={18} />
          </div>
          <span className="font-heading text-lg font-bold text-ink hidden sm:block">
            Ruang Cerita
          </span>
        </div>

        <div className="flex-1 relative max-w-xl">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Cari judul cerita..."
            className="w-full pl-10 pr-4 py-2 bg-elevated border border-border rounded-full text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <button
          onClick={onNewStory}
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-strong text-white rounded-btn text-sm font-medium transition-colors shrink-0"
        >
          <Plus size={16} /> Tulis Baru
        </button>

        <button
          onClick={onNewStory}
          aria-label="Tulis cerita baru"
          className="md:hidden flex items-center justify-center w-10 h-10 bg-primary hover:bg-primary-strong text-white rounded-full transition-colors shrink-0"
        >
          <Plus size={18} />
        </button>

        <ThemeSwitcher />
      </div>
    </header>
  );
}
