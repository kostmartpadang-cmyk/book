'use client';

import { BookOpen, Home, Library, PenLine, LogIn, LogOut, User, Feather } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import { useAuth } from './AuthProvider';

interface SidebarProps {
  section: 'stories' | 'poems';
  onSectionChange: (s: 'stories' | 'poems') => void;
  activeTab: 'shelves' | 'all';
  onTabChange: (t: 'shelves' | 'all') => void;
  onNewStory: () => void;
  onNewPoem: () => void;
  onOpenAuth: () => void;
}

export default function Sidebar({
  section,
  onSectionChange,
  activeTab,
  onTabChange,
  onNewStory,
  onNewPoem,
  onOpenAuth,
}: SidebarProps) {
  const { user, signOut } = useAuth();
  const displayName = (user?.user_metadata?.display_name as string) || user?.email || '';

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 h-screen sticky top-0 z-20 bg-surface border-r border-border">
      <div className="px-4 pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-btn bg-primary text-white flex items-center justify-center shrink-0">
            <BookOpen size={18} />
          </div>
          <span className="font-heading text-lg font-bold text-ink">Ruang Cerita</span>
        </div>
        <p className="font-heading italic text-xs text-ink-muted mt-2 leading-relaxed">
          Sebab tidak semua hal mampu diucapkan, dan tidak semua perasaan menemukan tempat untuk pulang.
        </p>
      </div>

      <nav className="flex flex-col gap-1 flex-1 min-h-0 overflow-y-auto px-4 py-4">
        <button
          onClick={() => { onSectionChange('stories'); onTabChange('shelves'); }}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-colors ${
            section === 'stories' && activeTab === 'shelves' ? 'bg-primary-soft text-primary-strong' : 'text-ink-muted hover:bg-surface-hover hover:text-ink'
          }`}
        >
          <Home size={18} /> Beranda
        </button>
        <button
          onClick={() => { onSectionChange('stories'); onTabChange('all'); }}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-colors ${
            section === 'stories' && activeTab === 'all' ? 'bg-primary-soft text-primary-strong' : 'text-ink-muted hover:bg-surface-hover hover:text-ink'
          }`}
        >
          <Library size={18} /> Semua Cerita
        </button>
        <button
          onClick={() => onSectionChange('poems')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-colors ${
            section === 'poems' ? 'bg-primary-soft text-primary-strong' : 'text-ink-muted hover:bg-surface-hover hover:text-ink'
          }`}
        >
          <Feather size={18} /> Puisi
        </button>
      </nav>

      <div className="flex flex-col gap-3 p-4 border-t border-border shrink-0">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-ink-muted font-medium">Tema Situs</span>
          <ThemeSwitcher panelPosition="top" panelAlign="left" />
        </div>

        {user ? (
          <div className="flex items-center gap-2 px-2">
            <div className="w-7 h-7 rounded-full bg-primary-soft text-primary-strong flex items-center justify-center shrink-0">
              <User size={14} />
            </div>
            <span className="text-xs text-ink truncate flex-1" title={displayName}>
              {displayName}
            </span>
            <button
              onClick={signOut}
              aria-label="Keluar"
              className="text-ink-muted hover:text-red-500 transition-colors shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-btn text-sm font-medium text-ink-muted hover:bg-surface-hover hover:text-ink transition-colors"
          >
            <LogIn size={15} /> Masuk / Daftar
          </button>
        )}

        <button
          onClick={section === 'poems' ? onNewPoem : onNewStory}
          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-primary hover:bg-primary-strong text-white rounded-btn text-sm font-bold transition-colors"
        >
          <PenLine size={16} /> {section === 'poems' ? 'Tulis Puisi' : 'Tulis Baru'}
        </button>
      </div>
    </aside>
  );
}
