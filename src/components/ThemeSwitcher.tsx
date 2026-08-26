'use client';

import { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { themes } from '@/lib/themes';
import { useTheme } from './ThemeProvider';

interface ThemeSwitcherProps {
  panelPosition?: 'bottom' | 'top';
  panelAlign?: 'left' | 'right';
}

export default function ThemeSwitcher({ panelPosition = 'bottom', panelAlign = 'right' }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-primary text-white shadow-sm flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shrink-0"
        aria-label="Ganti tema"
      >
        <Palette size={18} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`absolute w-72 max-h-[min(26rem,80vh)] flex flex-col rounded-card bg-surface backdrop-blur-lg border border-border shadow-card p-4 z-50 ${
              panelPosition === 'top' ? 'bottom-full mb-3' : 'top-full mt-3'
            } ${panelAlign === 'left' ? 'left-0' : 'right-0'}`}
          >
            <p className="text-sm font-semibold text-ink mb-3 font-heading shrink-0">Pilih Tema</p>
            <div className="space-y-2 overflow-y-auto">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-btn border transition-all text-left ${
                    theme === t.id
                      ? 'border-primary bg-primary-soft'
                      : 'border-transparent hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex -space-x-1 shrink-0">
                    {t.swatch.map((c, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-full border border-white/40"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink">{t.label}</div>
                    <div className="text-xs text-ink-muted truncate">{t.description}</div>
                  </div>
                  {theme === t.id && (
                    <Check size={16} className="text-primary-strong shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
