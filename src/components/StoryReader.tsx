'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Settings2,
  Palette,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Save,
  Loader2,
  ArrowUp,
  ArrowDown,
  UserCheck,
  ChevronDown,
} from 'lucide-react';
import { themes, DEFAULT_THEME } from '@/lib/themes';
import { useAuth } from './AuthProvider';

export interface Chapter {
  id: string; // 'main' for the story's built-in first chapter, otherwise a chapters.id uuid
  number: number;
  title: string;
  content: string;
}

interface StoryReaderProps {
  storyId: string;
  chapters: Chapter[];
  theme?: string;
  isOwner?: boolean;
  canClaim?: boolean;
  onBack: () => void;
  onChaptersChanged: () => void;
  onClaim?: () => void;
}

type Effect = 'none' | 'fade' | 'typewriter' | 'book';

const WORDS_PER_PAGE = 320;
const PAGE_BREAK_MARKER = '[[HALAMAN]]';

// If the writer placed manual page-break markers in the text, honor those
// exactly (full control, no awkward auto-cuts). Otherwise fall back to
// automatic pagination capped at a fixed word count per page.
function paginateContent(content: string): string[][] {
  if (content.includes(PAGE_BREAK_MARKER)) {
    return content
      .split(PAGE_BREAK_MARKER)
      .map((segment) => segment.split(/\n+/).map((p) => p.trim()).filter((p) => p.length > 0));
  }

  const paragraphs = content.split(/\n+/).filter((p) => p.trim().length > 0);
  const pages: string[][] = [];
  let currentPage: string[] = [];
  let currentWordCount = 0;

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let start = 0;
    while (start < words.length) {
      const remaining = WORDS_PER_PAGE - currentWordCount;
      if (remaining <= 0) {
        pages.push(currentPage);
        currentPage = [];
        currentWordCount = 0;
        continue;
      }
      const chunk = words.slice(start, start + remaining);
      currentPage.push(chunk.join(' '));
      currentWordCount += chunk.length;
      start += chunk.length;
    }
  }
  if (currentPage.length) pages.push(currentPage);
  return pages;
}

export default function StoryReader({
  storyId,
  chapters,
  theme = DEFAULT_THEME,
  isOwner = false,
  canClaim = false,
  onBack,
  onChaptersChanged,
  onClaim,
}: StoryReaderProps) {
  const { authHeader } = useAuth();
  const [effect, setEffect] = useState<Effect>('none');
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const [spread, setSpread] = useState(0);
  const [activeChapterId, setActiveChapterId] = useState(chapters[0]?.id);
  const [editMode, setEditMode] = useState<'none' | 'edit' | 'add'>('none');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  const themeDef = themes.find((t) => t.id === theme);

  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const contentToHtml = (content: string) => {
    const blocks = content.split(/\n+/).filter((p) => p.trim().length > 0);
    if (blocks.length === 0) return '<p><br></p>';
    return blocks.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
  };

  const getEditableContent = () => {
    const el = editableRef.current;
    if (!el) return formContent;
    const blocks = Array.from(el.querySelectorAll('p'));
    if (blocks.length === 0) return (el.innerText || '').trim();
    return blocks
      .map((p) => (p.textContent || '').trim())
      .filter(Boolean)
      .join('\n\n');
  };

  const insertPageBreak = () => {
    const el = editableRef.current;
    if (!el) return;
    el.focus();
    document.execCommand('insertText', false, `\n${PAGE_BREAK_MARKER}\n`);
  };

  useEffect(() => {
    setActiveChapterId(chapters[0]?.id);
  }, [storyId]);

  const activeChapter = chapters.find((c) => c.id === activeChapterId) || chapters[0];
  const text = activeChapter?.content || '';

  // Split text into paragraphs
  const paragraphs = useMemo(
    () => text.split(/\n+/).filter((p) => p.trim().length > 0),
    [text]
  );

  const bookPages = useMemo(() => paginateContent(text), [text]);
  const totalPages = Math.max(1, bookPages.length);

  useEffect(() => {
    setSpread(0);
  }, [text]);

  const openAddChapter = () => {
    setFormTitle(`Bab ${chapters.length + 1}`);
    setFormContent('');
    setFormError(null);
    setEditMode('add');
    setShowSettings(false);
  };

  const openEditChapter = () => {
    if (!activeChapter) return;
    setFormTitle(activeChapter.title);
    setFormContent(activeChapter.content);
    setFormError(null);
    setEditMode('edit');
    setShowSettings(false);
  };

  const submitAddChapter = async () => {
    const content = getEditableContent();
    if (!content.trim()) {
      setFormError('Isi bab tidak boleh kosong.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/stories/${storyId}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ title: formTitle, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambah bab');
      setEditMode('none');
      onChaptersChanged();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const submitEditChapter = async () => {
    if (!activeChapter) return;
    const content = getEditableContent();
    if (!content.trim()) {
      setFormError('Isi bab tidak boleh kosong.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const url =
        activeChapter.id === 'main'
          ? `/api/stories/${storyId}`
          : `/api/stories/${storyId}/chapters/${activeChapter.id}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ title: formTitle, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan perubahan');
      setEditMode('none');
      onChaptersChanged();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteChapter = async () => {
    if (!activeChapter || activeChapter.id === 'main') return;
    if (!confirm(`Hapus "${activeChapter.title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      const res = await fetch(`/api/stories/${storyId}/chapters/${activeChapter.id}`, {
        method: 'DELETE',
        headers: { ...authHeader() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus bab');
      setActiveChapterId(chapters[0]?.id);
      onChaptersChanged();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Swap order between two extra chapters (chapter "main" always stays first).
  const moveChapter = async (chapterId: string, direction: 'up' | 'down') => {
    const extra = chapters.filter((c) => c.id !== 'main');
    const idx = extra.findIndex((c) => c.id === chapterId);
    if (idx === -1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= extra.length) return;

    const a = extra[idx];
    const b = extra[swapIdx];

    try {
      await Promise.all([
        fetch(`/api/stories/${storyId}/chapters/${a.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          body: JSON.stringify({ chapter_number: b.number }),
        }),
        fetch(`/api/stories/${storyId}/chapters/${b.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          body: JSON.stringify({ chapter_number: a.number }),
        }),
      ]);
      onChaptersChanged();
    } catch (err: any) {
      alert('Gagal memindahkan bab.');
    }
  };

  const renderEffect = () => {
    switch (effect) {
      case 'fade':
        return paragraphs.map((p, idx) => (
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: idx * 0.1 }}
            className="mb-6 leading-relaxed text-lg"
          >
            {p}
          </motion.p>
        ));

      case 'typewriter':
        return (
          <motion.div
            initial={{ opacity: 1 }}
            className="mb-6 leading-relaxed text-lg whitespace-pre-wrap"
          >
            {text.split('').map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.1,
                  delay: index * 0.02,
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>
        );

      case 'none':
      default:
        return bookPages.map((page, pageIdx) => (
          <div key={pageIdx}>
            {page.map((p, i) => (
              <p key={i} className="mb-6 leading-relaxed text-lg">
                {p}
              </p>
            ))}
            {pageIdx < bookPages.length - 1 && (
              <div className="flex items-center gap-3 my-8 text-ink-muted/60">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs font-medium shrink-0">{pageIdx + 1}</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}
          </div>
        ));
    }
  };

  const renderBook = () => {
    const pageContent = bookPages[spread];

    return (
      <div className="flex flex-col items-center">
        <div
          className="relative w-full max-w-3xl mx-auto sm:[filter:drop-shadow(6px_6px_0_var(--surface-hover))_drop-shadow(12px_12px_0_var(--border))]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={spread}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="bg-canvas border border-border sm:border-2 rounded-md sm:rounded-lg overflow-hidden p-4 sm:p-8 md:p-16 h-[62vh] sm:h-[75vh] md:h-[80vh] min-h-[360px] sm:min-h-[480px] md:min-h-[560px] flex flex-col"
            >
              <div className="flex-1 overflow-y-auto pr-1 no-scrollbar">
                {pageContent?.map((p, i) => (
                  <p key={i} className="mb-3 sm:mb-5 leading-relaxed sm:leading-loose text-sm sm:text-lg md:text-xl font-body">
                    {p}
                  </p>
                ))}
              </div>
              <div className="text-xs sm:text-sm text-ink-muted text-center pt-3 sm:pt-4 shrink-0">{spread + 1}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={() => setSpread((s) => Math.max(0, s - 1))}
            disabled={spread === 0}
            aria-label="Halaman sebelumnya"
            className="p-2 rounded-full bg-surface border border-border disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-ink-muted">
            Halaman {spread + 1} / {totalPages}
          </span>
          <button
            onClick={() => setSpread((s) => Math.min(totalPages - 1, s + 1))}
            disabled={spread >= totalPages - 1}
            aria-label="Halaman berikutnya"
            className="p-2 rounded-full bg-surface border border-border disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      data-theme={theme}
      className="w-full max-w-4xl mx-auto relative bg-elevated min-h-screen text-ink p-4 sm:p-8 md:p-12 shadow-card rounded-card"
    >
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-4 sm:mb-6 sticky top-0 bg-elevated/90 backdrop-blur py-3 sm:py-4 z-10 border-b border-border">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft size={20} /> Kembali
        </button>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 text-ink-muted hover:text-ink transition-colors p-2 rounded-btn hover:bg-surface-hover"
            >
              <Settings2 size={20} /> <span className="hidden sm:inline">Efek Visual</span>
            </button>

            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-elevated border border-border rounded-card shadow-xl overflow-hidden z-20">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => { setEffect('none'); setShowSettings(false); }}
                    className={`w-full text-left px-4 py-2 rounded-btn text-sm transition-colors ${effect === 'none' ? 'bg-primary-soft text-primary-strong' : 'text-ink-muted hover:bg-surface-hover'}`}
                  >
                    Tanpa Efek
                  </button>
                  <button
                    onClick={() => { setEffect('fade'); setShowSettings(false); }}
                    className={`w-full text-left px-4 py-2 rounded-btn text-sm transition-colors ${effect === 'fade' ? 'bg-primary-soft text-primary-strong' : 'text-ink-muted hover:bg-surface-hover'}`}
                  >
                    Fade In (Scroll)
                  </button>
                  <button
                    onClick={() => { setEffect('typewriter'); setShowSettings(false); }}
                    className={`w-full text-left px-4 py-2 rounded-btn text-sm transition-colors ${effect === 'typewriter' ? 'bg-primary-soft text-primary-strong' : 'text-ink-muted hover:bg-surface-hover'}`}
                  >
                    Typewriter
                  </button>
                  <button
                    onClick={() => { setEffect('book'); setShowSettings(false); }}
                    className={`w-full text-left px-4 py-2 rounded-btn text-sm transition-colors flex items-center gap-2 ${effect === 'book' ? 'bg-primary-soft text-primary-strong' : 'text-ink-muted hover:bg-surface-hover'}`}
                  >
                    <BookOpen size={14} /> Lembaran Buku
                  </button>
                </div>
              </div>
            )}
          </div>

          {isOwner && (
            <>
              <button
                onClick={openEditChapter}
                className="flex items-center gap-2 text-ink-muted hover:text-ink transition-colors p-2 rounded-btn hover:bg-surface-hover"
                aria-label="Edit bab ini"
              >
                <Pencil size={20} /> <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={openAddChapter}
                className="flex items-center gap-2 text-ink-muted hover:text-ink transition-colors p-2 rounded-btn hover:bg-surface-hover"
                aria-label="Tambah bab baru"
              >
                <Plus size={20} /> <span className="hidden sm:inline">Tambah Bab</span>
              </button>
              {activeChapter?.id !== 'main' && (
                <button
                  onClick={deleteChapter}
                  className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 transition-colors p-2 rounded-btn"
                  aria-label="Hapus bab ini"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </>
          )}

          {canClaim && (
            <button
              onClick={onClaim}
              className="flex items-center gap-1.5 text-xs font-medium bg-primary text-white px-3 py-1.5 rounded-full hover:bg-primary-strong transition-colors"
            >
              <UserCheck size={14} /> Klaim Cerita Ini
            </button>
          )}

          {themeDef && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-ink-muted bg-surface-hover px-3 py-1.5 rounded-full border border-border">
              <Palette size={14} className="text-primary" />
              {themeDef.label}
            </div>
          )}
        </div>
      </div>

      {/* Chapter selector */}
      {chapters.length > 1 && (
        <>
          {/* Desktop/tablet: chip row */}
          <div className="hidden sm:flex items-center gap-2 mb-8 flex-wrap">
            {chapters.map((c, idx) => {
              const extraIdx = idx - 1; // index within non-"main" chapters, -1 for main
              return (
                <div
                  key={c.id}
                  className={`flex items-center rounded-full border transition-colors ${
                    c.id === activeChapterId
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface border-border text-ink-muted hover:bg-surface-hover hover:text-ink'
                  }`}
                >
                  <button onClick={() => setActiveChapterId(c.id)} className="px-3.5 py-1.5 text-sm font-medium">
                    {c.title}
                  </button>
                  {isOwner && extraIdx >= 0 && (
                    <div className="flex items-center pr-1.5 gap-0.5">
                      <button
                        onClick={() => moveChapter(c.id, 'up')}
                        disabled={extraIdx === 0}
                        aria-label="Pindah ke atas"
                        className="p-1 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/10"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => moveChapter(c.id, 'down')}
                        disabled={extraIdx === chapters.length - 2}
                        aria-label="Pindah ke bawah"
                        className="p-1 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/10"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile: dropdown */}
          <div className="sm:hidden relative mb-8">
            <button
              onClick={() => setShowChapterDropdown(!showChapterDropdown)}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-btn bg-surface border border-border text-ink font-medium text-sm"
            >
              <span className="truncate">{activeChapter?.title}</span>
              <ChevronDown
                size={16}
                className={`text-ink-muted shrink-0 transition-transform ${showChapterDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {showChapterDropdown && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowChapterDropdown(false)} />
                <div className="absolute left-0 right-0 top-full mt-2 max-h-72 overflow-y-auto bg-elevated border border-border rounded-card shadow-xl z-40">
                  {chapters.map((c, idx) => {
                    const extraIdx = idx - 1;
                    return (
                      <div
                        key={c.id}
                        className={`flex items-center justify-between gap-2 px-4 py-3 border-b border-border last:border-b-0 ${
                          c.id === activeChapterId ? 'bg-primary-soft text-primary-strong' : 'text-ink'
                        }`}
                      >
                        <button
                          onClick={() => { setActiveChapterId(c.id); setShowChapterDropdown(false); }}
                          className="flex-1 text-left text-sm font-medium truncate"
                        >
                          {c.title}
                        </button>
                        {isOwner && extraIdx >= 0 && (
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              onClick={() => moveChapter(c.id, 'up')}
                              disabled={extraIdx === 0}
                              aria-label="Pindah ke atas"
                              className="p-1.5 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-hover"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              onClick={() => moveChapter(c.id, 'down')}
                              disabled={extraIdx === chapters.length - 2}
                              aria-label="Pindah ke bawah"
                              className="p-1.5 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-hover"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Story Content */}
      {editMode !== 'none' ? (
        <div>
          <h3 className="font-heading text-lg font-bold text-ink mb-4">
            {editMode === 'add' ? 'Tambah Bab Baru' : 'Edit Bab'}
          </h3>

          <label className="block text-sm font-medium text-ink-muted mb-2">Judul Bab</label>
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Judul bab..."
            className="w-full p-3 mb-4 bg-canvas border border-border rounded-btn text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          />

          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-ink-muted">Isi Bab</label>
            <button
              type="button"
              onClick={insertPageBreak}
              className="text-xs font-medium text-primary-strong hover:underline"
            >
              + Sisipkan Batas Halaman
            </button>
          </div>
          <div
            key={`${activeChapterId}-${editMode}`}
            ref={editableRef}
            contentEditable
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: contentToHtml(formContent) }}
            className="font-body text-ink text-lg leading-relaxed mb-1.5 min-h-[40vh] p-3 -mx-3 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary/50 [&_p]:mb-6"
          />
          <p className="text-xs text-ink-muted mb-4">
            Klik teks di atas untuk mengedit langsung. Klik "+ Sisipkan Batas Halaman" di posisi kursor untuk
            menentukan sendiri di mana halaman terpotong — tanpa itu, halaman dibagi otomatis tiap ~320 kata.
          </p>

          {formError && <p className="text-red-500 text-sm mb-4">{formError}</p>}

          <div className="flex gap-3">
            <button
              onClick={() => setEditMode('none')}
              className="px-5 py-3 rounded-btn font-medium text-ink-muted hover:bg-surface-hover transition-colors"
            >
              Batal
            </button>
            <button
              onClick={editMode === 'add' ? submitAddChapter : submitEditChapter}
              disabled={saving}
              className="flex-1 py-3 bg-primary hover:bg-primary-strong flex justify-center items-center gap-2 text-white rounded-btn font-medium transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Simpan
            </button>
          </div>
        </div>
      ) : effect === 'book' ? (
        renderBook()
      ) : (
        <div className="font-body text-ink max-w-none">
          {renderEffect()}
        </div>
      )}
    </div>
  );
}
