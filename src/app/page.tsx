'use client';

import { useState, useEffect, useMemo } from 'react';
import StoryUploader from '@/components/StoryUploader';
import StoryReader, { Chapter } from '@/components/StoryReader';
import PoemUploader from '@/components/PoemUploader';
import PoemCard from '@/components/PoemCard';
import PoemReader from '@/components/PoemReader';
import FallingLeaves from '@/components/FallingLeaves';
import OceanOrnaments from '@/components/OceanOrnaments';
import SpringPetals from '@/components/SpringPetals';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import Sidebar from '@/components/Sidebar';
import BookCover from '@/components/BookCover';
import AuthModal from '@/components/AuthModal';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { BookOpen, PenLine, Search, X, MoreVertical, Pencil, Trash2, Loader2, Image as ImageIcon, Globe, Lock, Feather } from 'lucide-react';
import { themes, DEFAULT_THEME } from '@/lib/themes';
import { resizeImageToDataUrl } from '@/lib/image';

interface Story {
  id: string;
  title: string;
  created_at: string;
  theme: string;
  cover_url: string | null;
  user_id: string | null;
  is_published: boolean;
}

interface StoryDetail {
  id: string;
  title: string;
  theme: string;
  user_id: string | null;
  chapters: Chapter[];
}

interface Poem {
  id: string;
  title: string;
  created_at: string;
  theme: string;
  content: string | null;
  image_url: string | null;
  user_id: string | null;
  is_published: boolean;
}

export default function Home() {
  const { theme: siteTheme } = useTheme();
  const { user, authHeader } = useAuth();
  const [section, setSection] = useState<'stories' | 'poems'>('stories');

  const [activeStory, setActiveStory] = useState<StoryDetail | null>(null);
  const [loadingStory, setLoadingStory] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'shelves' | 'all'>('shelves');
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editContentLoading, setEditContentLoading] = useState(false);
  const [editTheme, setEditTheme] = useState(DEFAULT_THEME);
  const [editCoverUrl, setEditCoverUrl] = useState<string | null>(null);
  const [editCoverProcessing, setEditCoverProcessing] = useState(false);
  const [editIsPublished, setEditIsPublished] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  const [poems, setPoems] = useState<Poem[]>([]);
  const [loadingPoems, setLoadingPoems] = useState(true);
  const [activePoemId, setActivePoemId] = useState<string | null>(null);
  const [showCreatePoemModal, setShowCreatePoemModal] = useState(false);
  const [editingPoem, setEditingPoem] = useState<Poem | null>(null);
  const [editPoemTitle, setEditPoemTitle] = useState('');
  const [editPoemContent, setEditPoemContent] = useState('');
  const [editPoemImageUrl, setEditPoemImageUrl] = useState<string | null>(null);
  const [editPoemTheme, setEditPoemTheme] = useState(DEFAULT_THEME);
  const [editPoemIsPublished, setEditPoemIsPublished] = useState(true);
  const [savingPoemEdit, setSavingPoemEdit] = useState(false);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [query, setQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const activePoem = poems.find((p) => p.id === activePoemId) || null;

  // Opening a reader pushes a browser history entry, so the phone's back
  // button closes the reader instead of leaving the site entirely.
  const openPoem = (id: string) => {
    setActivePoemId(id);
    window.history.pushState({ view: 'reader' }, '', window.location.href);
  };

  useEffect(() => {
    const handlePopState = () => {
      if (activeStory) {
        setActiveStory(null);
      } else if (activePoemId) {
        setActivePoemId(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeStory, activePoemId]);

  // Which theme governs the current view: the story/poem's own theme while reading,
  // otherwise the site-wide theme while browsing the catalog.
  const activeTheme = activeStory ? activeStory.theme : activePoem ? activePoem.theme : siteTheme;
  const showNatureBg = activeTheme === 'soft';
  const showCuteBg = activeTheme === 'cute';
  const showLautanBg = activeTheme === 'lautan';
  const showSpringBg = activeTheme === 'musim-semi';
  const [lautanBg, setLautanBg] = useState<string | null>(null);

  useEffect(() => {
    fetchStories();
    fetchPoems();
  }, [user]);

  // Setiap kali tema Lautan aktif, ambil daftar foto terbaru dari /public/lautan
  // dan pilih satu secara acak — otomatis mengikuti foto baru yang ditambahkan.
  useEffect(() => {
    if (!showLautanBg) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/lautan-images');
        const data = await res.json();
        if (!cancelled && Array.isArray(data.images) && data.images.length > 0) {
          const random = data.images[Math.floor(Math.random() * data.images.length)];
          setLautanBg(random);
        }
      } catch (error) {
        console.error('Failed to load lautan images:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showLautanBg]);

  const fetchStories = async () => {
    try {
      setLoadingStories(true);
      const res = await fetch('/api/stories', { headers: { ...authHeader() } });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setStories(data);
      }
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    } finally {
      setLoadingStories(false);
    }
  };

  const fetchPoems = async () => {
    try {
      setLoadingPoems(true);
      const res = await fetch('/api/poems', { headers: { ...authHeader() } });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setPoems(data);
      }
    } catch (error) {
      console.error('Failed to fetch poems:', error);
    } finally {
      setLoadingPoems(false);
    }
  };

  const fetchStoryDetail = async (id: string) => {
    setLoadingStory(true);
    try {
      const res = await fetch(`/api/stories/${id}`, { headers: { ...authHeader() } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuka cerita');
      setActiveStory(data);
    } catch (error) {
      console.error('Failed to open story:', error);
      alert('Gagal membuka cerita.');
    } finally {
      setLoadingStory(false);
    }
  };

  // Opening a reader pushes a browser history entry, so the phone's back
  // button closes the reader instead of leaving the site entirely.
  const openStory = async (id: string) => {
    await fetchStoryDetail(id);
    window.history.pushState({ view: 'reader' }, '', window.location.href);
  };

  const refreshActiveStory = () => {
    if (activeStory) fetchStoryDetail(activeStory.id);
  };

  const claimStory = async () => {
    if (!activeStory) return;
    try {
      const res = await fetch(`/api/stories/${activeStory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ claim: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengklaim cerita');
      fetchStories();
      refreshActiveStory();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const deleteStory = async (id: string) => {
    if (!confirm('Hapus cerita ini beserta semua babnya? Tindakan ini tidak bisa dibatalkan.')) return;
    try {
      const res = await fetch(`/api/stories/${id}`, { method: 'DELETE', headers: { ...authHeader() } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus cerita');
      setOpenMenuId(null);
      if (activeStory?.id === id) setActiveStory(null);
      fetchStories();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const openEditStory = async (story: Story) => {
    setEditingStory(story);
    setEditTitle(story.title);
    setEditTheme(story.theme || DEFAULT_THEME);
    setEditCoverUrl(story.cover_url || null);
    setEditIsPublished(story.is_published !== false);
    setEditContent('');
    setOpenMenuId(null);

    setEditContentLoading(true);
    try {
      const res = await fetch(`/api/stories/${story.id}`, { headers: { ...authHeader() } });
      const data = await res.json();
      if (res.ok) setEditContent(data.content || '');
    } catch (error) {
      console.error('Failed to load story content:', error);
    } finally {
      setEditContentLoading(false);
    }
  };

  const handleEditCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditCoverProcessing(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file, 500, 0.82);
      setEditCoverUrl(dataUrl);
    } finally {
      setEditCoverProcessing(false);
    }
  };

  const submitEditStory = async () => {
    if (!editingStory) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/stories/${editingStory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          theme: editTheme,
          cover_url: editCoverUrl,
          is_published: editIsPublished,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan perubahan');
      setEditingStory(null);
      fetchStories();
      if (activeStory?.id === editingStory.id) refreshActiveStory();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const deletePoem = async (id: string) => {
    if (!confirm('Hapus puisi ini? Tindakan ini tidak bisa dibatalkan.')) return;
    try {
      const res = await fetch(`/api/poems/${id}`, { method: 'DELETE', headers: { ...authHeader() } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus puisi');
      setOpenMenuId(null);
      if (activePoemId === id) setActivePoemId(null);
      fetchPoems();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const openEditPoem = (poem: Poem) => {
    setEditingPoem(poem);
    setEditPoemTitle(poem.title);
    setEditPoemContent(poem.content || '');
    setEditPoemImageUrl(poem.image_url || null);
    setEditPoemTheme(poem.theme || DEFAULT_THEME);
    setEditPoemIsPublished(poem.is_published !== false);
    setOpenMenuId(null);
  };

  const handleEditPoemImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageToDataUrl(file, 900, 0.85);
      setEditPoemImageUrl(dataUrl);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const submitEditPoem = async () => {
    if (!editingPoem) return;
    setSavingPoemEdit(true);
    try {
      const res = await fetch(`/api/poems/${editingPoem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          title: editPoemTitle,
          content: editPoemImageUrl ? null : editPoemContent,
          image_url: editPoemImageUrl,
          theme: editPoemTheme,
          is_published: editPoemIsPublished,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan perubahan');
      setEditingPoem(null);
      fetchPoems();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSavingPoemEdit(false);
    }
  };

  const filteredStories = useMemo(() => {
    if (!query.trim()) return stories;
    return stories.filter((s) => s.title.toLowerCase().includes(query.trim().toLowerCase()));
  }, [stories, query]);

  const filteredPoems = useMemo(() => {
    if (!query.trim()) return poems;
    return poems.filter((p) => p.title.toLowerCase().includes(query.trim().toLowerCase()));
  }, [poems, query]);

  const shelfGroups = useMemo(() => {
    return themes
      .map((t) => ({
        themeDef: t,
        items: filteredStories.filter((s) => (s.theme || DEFAULT_THEME) === t.id),
      }))
      .filter((g) => g.items.length > 0);
  }, [filteredStories]);

  const handleNewStoryClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowCreateModal(true);
  };

  const handleNewPoemClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowCreatePoemModal(true);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  const CardMenu = ({ story }: { story: Story }) => {
    if (!user || story.user_id !== user.id) return null;
    return (
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setOpenMenuId(openMenuId === story.id ? null : story.id)}
          aria-label="Menu cerita"
          className="w-7 h-7 rounded-full flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors"
        >
          <MoreVertical size={16} />
        </button>
        {openMenuId === story.id && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
            <div className="absolute right-0 top-full mt-1 w-36 bg-elevated border border-border rounded-btn shadow-card overflow-hidden z-50">
              <button
                onClick={() => openEditStory(story)}
                className="w-full text-left px-3 py-2 text-sm text-ink-muted hover:bg-surface-hover hover:text-ink transition-colors flex items-center gap-2"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={() => deleteStory(story.id)}
                className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
              >
                <Trash2 size={14} /> Hapus
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const PoemCardMenu = ({ poem }: { poem: Poem }) => {
    if (!user || poem.user_id !== user.id) return null;
    return (
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setOpenMenuId(openMenuId === poem.id ? null : poem.id)}
          aria-label="Menu puisi"
          className="w-7 h-7 rounded-full flex items-center justify-center bg-black/30 text-white hover:bg-black/50 transition-colors"
        >
          <MoreVertical size={16} />
        </button>
        {openMenuId === poem.id && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
            <div className="absolute right-0 top-full mt-1 w-36 bg-elevated border border-border rounded-btn shadow-card overflow-hidden z-50">
              <button
                onClick={() => openEditPoem(poem)}
                className="w-full text-left px-3 py-2 text-sm text-ink-muted hover:bg-surface-hover hover:text-ink transition-colors flex items-center gap-2"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={() => deletePoem(poem.id)}
                className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
              >
                <Trash2 size={14} /> Hapus
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const inReader = !!activeStory || !!activePoem;

  return (
    <main className="min-h-screen bg-canvas text-ink selection:bg-primary/30 font-body">
      {/* Background: hanya untuk tema Alam Lembut */}
      {showNatureBg && (
        <>
          <div className="fixed inset-0 bg-[url('/bg-daun.png')] bg-cover bg-center bg-no-repeat opacity-60 pointer-events-none animate-bg-pan" />
          <FallingLeaves />
        </>
      )}

      {/* Background: hanya untuk tema Cute */}
      {showCuteBg && (
        <div className="fixed inset-0 bg-[url('/bg-cat.png')] bg-repeat bg-[length:120px_120px] opacity-25 pointer-events-none animate-bg-drift" />
      )}

      {/* Background: hanya untuk tema Lautan — foto acak dari /public/lautan */}
      {showLautanBg && lautanBg && (
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-50 pointer-events-none animate-bg-pan"
          style={{ backgroundImage: `url('${lautanBg}')` }}
        />
      )}
      {showLautanBg && <OceanOrnaments />}

      {/* Background: hanya untuk tema Musim Semi */}
      {showSpringBg && <SpringPetals />}

      <div className="relative z-10 flex">
        {!inReader && (
          <Sidebar
            section={section}
            onSectionChange={setSection}
            activeTab={viewMode}
            onTabChange={setViewMode}
            onNewStory={handleNewStoryClick}
            onNewPoem={handleNewPoemClick}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}

        <div className="flex-1 min-w-0">
          {!inReader ? (
            <div className="p-4 sm:p-6 lg:p-8 pb-20">
              {/* Mobile top bar */}
              <div className="md:hidden flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-btn bg-primary text-white flex items-center justify-center">
                    <BookOpen size={16} />
                  </div>
                  <span className="font-heading text-base font-bold text-ink">Ruang Cerita</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeSwitcher />
                  {!user && (
                    <button
                      onClick={() => setShowAuthModal(true)}
                      aria-label="Masuk"
                      className="px-3 h-9 rounded-full border border-border text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors"
                    >
                      Masuk
                    </button>
                  )}
                  <button
                    onClick={section === 'poems' ? handleNewPoemClick : handleNewStoryClick}
                    aria-label="Buat baru"
                    className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center"
                  >
                    <PenLine size={16} />
                  </button>
                </div>
              </div>

              {/* Mobile section switcher */}
              <div className="md:hidden flex items-center gap-1 bg-surface border border-border rounded-btn p-1 mb-4">
                <button
                  onClick={() => setSection('stories')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[calc(var(--radius-btn)-4px)] text-sm font-medium transition-colors ${
                    section === 'stories' ? 'bg-primary-soft text-primary-strong' : 'text-ink-muted'
                  }`}
                >
                  <BookOpen size={14} /> Cerita
                </button>
                <button
                  onClick={() => setSection('poems')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[calc(var(--radius-btn)-4px)] text-sm font-medium transition-colors ${
                    section === 'poems' ? 'bg-primary-soft text-primary-strong' : 'text-ink-muted'
                  }`}
                >
                  <Feather size={14} /> Puisi
                </button>
              </div>

              {/* Top bar: tabs + search */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
                {section === 'stories' && (
                  <div className="flex items-center gap-1 bg-surface border border-border rounded-btn p-1 shrink-0">
                    <button
                      onClick={() => setViewMode('shelves')}
                      className={`px-3.5 py-1.5 rounded-[calc(var(--radius-btn)-4px)] text-sm font-medium transition-colors ${
                        viewMode === 'shelves' ? 'bg-primary-soft text-primary-strong' : 'text-ink-muted hover:text-ink'
                      }`}
                    >
                      Rak
                    </button>
                    <button
                      onClick={() => setViewMode('all')}
                      className={`px-3.5 py-1.5 rounded-[calc(var(--radius-btn)-4px)] text-sm font-medium transition-colors ${
                        viewMode === 'all' ? 'bg-primary-soft text-primary-strong' : 'text-ink-muted hover:text-ink'
                      }`}
                    >
                      Semua Buku
                    </button>
                  </div>
                )}
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={section === 'poems' ? 'Cari judul puisi...' : 'Cari judul cerita...'}
                    className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-full text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {section === 'stories' ? (
                loadingStories ? (
                  <div className="text-ink-muted animate-pulse py-12 text-center">Memuat cerita...</div>
                ) : filteredStories.length === 0 ? (
                  <div className="text-ink-muted text-center py-16 border-2 border-dashed border-border rounded-card bg-surface/40 backdrop-blur-sm">
                    {query ? 'Tidak ada cerita yang cocok.' : 'Belum ada cerita. Jadilah yang pertama menulis!'}
                  </div>
                ) : viewMode === 'shelves' ? (
                  <div className="flex flex-col gap-10">
                    {shelfGroups.map((group) => (
                      <div key={group.themeDef.id}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1">
                              {group.themeDef.swatch.map((c, i) => (
                                <span key={i} className="w-3 h-3 rounded-full border border-white" style={{ background: c }} />
                              ))}
                            </div>
                            <h2 className="font-heading text-lg font-bold text-ink">{group.themeDef.label}</h2>
                          </div>
                          <button
                            onClick={() => setViewMode('all')}
                            className="text-sm text-primary-strong font-medium hover:underline shrink-0"
                          >
                            Lihat semua →
                          </button>
                        </div>

                        <div className="relative pb-3">
                          <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
                            {group.items.map((story) => (
                              <div key={story.id} className="relative">
                                <BookCover
                                  title={story.title}
                                  date={formatDate(story.created_at)}
                                  theme={story.theme || DEFAULT_THEME}
                                  coverUrl={story.cover_url}
                                  onClick={() => openStory(story.id)}
                                />
                                <div className="absolute top-2 right-2 bg-black/30 rounded-full">
                                  <CardMenu story={story} />
                                </div>
                                {!story.is_published && (
                                  <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Lock size={10} /> Draft
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="h-3 bg-border rounded-full mx-1 shadow-[0_8px_14px_-8px_rgba(0,0,0,0.35)]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStories.map((story) => {
                      const storyThemeDef = themes.find((t) => t.id === story.theme) || themes[0];
                      return (
                        <div
                          key={story.id}
                          className="group bg-surface backdrop-blur-md border border-border rounded-card shadow-card p-6 hover:bg-surface-hover hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex gap-4 h-48"
                          onClick={() => openStory(story.id)}
                        >
                          {story.cover_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={story.cover_url}
                              alt=""
                              className="w-16 h-full object-cover rounded-btn shrink-0 border border-border"
                            />
                          ) : (
                            <div
                              data-theme={story.theme || DEFAULT_THEME}
                              className="w-16 h-full rounded-btn shrink-0 bg-primary-strong flex items-center justify-center"
                            >
                              <ImageIcon className="text-white/50" size={20} />
                            </div>
                          )}
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex -space-x-1">
                                {storyThemeDef.swatch.map((c, i) => (
                                  <span key={i} className="w-3 h-3 rounded-full border border-white" style={{ background: c }} />
                                ))}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[11px] text-ink-muted font-medium">{storyThemeDef.label}</span>
                                <CardMenu story={story} />
                              </div>
                            </div>
                            <h3 className="font-heading text-xl font-bold text-ink mb-2 line-clamp-2 group-hover:text-primary-strong transition-colors flex items-center gap-2">
                              {story.title}
                              {!story.is_published && (
                                <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-hover text-ink-muted border border-border flex items-center gap-1">
                                  <Lock size={9} /> Draft
                                </span>
                              )}
                            </h3>
                            <p className="text-ink-muted text-sm mb-4">{formatDate(story.created_at)}</p>
                            <div className="mt-auto text-primary-strong text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              Baca sekarang <span>→</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : loadingPoems ? (
                <div className="text-ink-muted animate-pulse py-12 text-center">Memuat puisi...</div>
              ) : filteredPoems.length === 0 ? (
                <div className="text-ink-muted text-center py-16 border-2 border-dashed border-border rounded-card bg-surface/40 backdrop-blur-sm">
                  {query ? 'Tidak ada puisi yang cocok.' : 'Belum ada puisi. Jadilah yang pertama menulis!'}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Feather size={20} className="text-primary" />
                    <h2 className="font-heading text-lg font-bold text-ink">
                      Semua Puisi <span className="text-ink-muted font-normal">({filteredPoems.length})</span>
                    </h2>
                  </div>
                  <div className="relative pb-3">
                    <div className="flex flex-wrap gap-4 pb-4">
                      {filteredPoems.map((poem) => (
                        <div key={poem.id} className="relative">
                          <PoemCard
                            title={poem.title}
                            content={poem.content}
                            imageUrl={poem.image_url}
                            theme={poem.theme || DEFAULT_THEME}
                            onClick={() => openPoem(poem.id)}
                          />
                          <div className="absolute top-2 right-2">
                            <PoemCardMenu poem={poem} />
                          </div>
                          {!poem.is_published && (
                            <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Lock size={10} /> Draft
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeStory ? (
            <div className="py-4 sm:py-8 md:py-12 px-2 sm:px-4">
              <StoryReader
                storyId={activeStory.id}
                chapters={activeStory.chapters}
                theme={activeStory.theme}
                isOwner={!!user && user.id === activeStory.user_id}
                canClaim={!!user && !activeStory.user_id}
                onBack={() => window.history.back()}
                onChaptersChanged={refreshActiveStory}
                onClaim={claimStory}
              />
            </div>
          ) : activePoem ? (
            <div className="py-4 sm:py-8 md:py-12 px-2 sm:px-4">
              <PoemReader
                poemId={activePoem.id}
                title={activePoem.title}
                content={activePoem.content}
                imageUrl={activePoem.image_url}
                theme={activePoem.theme}
                isOwner={!!user && user.id === activePoem.user_id}
                onBack={() => window.history.back()}
                onEdit={() => openEditPoem(activePoem)}
                onDelete={() => deletePoem(activePoem.id)}
                onSaved={fetchPoems}
              />
            </div>
          ) : null}
        </div>
      </div>

      {loadingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <Loader2 className="animate-spin text-white" size={32} />
        </div>
      )}

      {/* Create Story Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-10 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative w-full max-w-3xl my-8">
            <button
              onClick={() => setShowCreateModal(false)}
              aria-label="Tutup"
              className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white border border-emerald-100 shadow-lg flex items-center justify-center text-emerald-600 hover:text-emerald-800 transition-colors"
            >
              <X size={18} />
            </button>
            <StoryUploader
              onStoryLoaded={async (id) => {
                setShowCreateModal(false);
                fetchStories();
                await openStory(id);
              }}
            />
          </div>
        </div>
      )}

      {/* Create Poem Modal */}
      {showCreatePoemModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-10 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreatePoemModal(false)}
          />
          <div className="relative w-full max-w-2xl my-8">
            <button
              onClick={() => setShowCreatePoemModal(false)}
              aria-label="Tutup"
              className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white border border-emerald-100 shadow-lg flex items-center justify-center text-emerald-600 hover:text-emerald-800 transition-colors"
            >
              <X size={18} />
            </button>
            <PoemUploader
              onSaved={(id) => {
                setShowCreatePoemModal(false);
                fetchPoems();
                openPoem(id);
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Story Modal */}
      {editingStory && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-10 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditingStory(null)}
          />
          <div className="relative w-full max-w-lg my-8 bg-elevated border border-border rounded-card shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-bold text-ink">Edit Cerita</h3>
              <button onClick={() => setEditingStory(null)} className="text-ink-muted hover:text-ink" aria-label="Tutup">
                <X size={20} />
              </button>
            </div>

            <label className="block text-sm font-medium text-ink-muted mb-2">Judul</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full p-3 mb-4 bg-canvas border border-border rounded-btn text-ink focus:outline-none focus:ring-2 focus:ring-primary/50"
            />

            <label className="block text-sm font-medium text-ink-muted mb-2">Cover</label>
            <div className="flex items-center gap-3 mb-4">
              <label className="relative w-16 h-24 shrink-0 rounded-btn border-2 border-dashed border-border hover:border-primary bg-canvas cursor-pointer flex items-center justify-center overflow-hidden transition-colors">
                {editCoverProcessing ? (
                  <Loader2 className="animate-spin text-primary" size={18} />
                ) : editCoverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={editCoverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="text-ink-muted" size={18} />
                )}
                <input type="file" accept="image/*" onChange={handleEditCoverChange} className="hidden" />
              </label>
              {editCoverUrl && (
                <button
                  type="button"
                  onClick={() => setEditCoverUrl(null)}
                  className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600"
                >
                  <X size={12} /> Hapus cover
                </button>
              )}
            </div>

            <label className="block text-sm font-medium text-ink-muted mb-2">
              Isi Cerita <span className="text-ink-muted font-normal">(Bab 1)</span>
            </label>
            <div className="relative mb-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                disabled={editContentLoading}
                className="w-full h-48 p-3 bg-canvas border border-border rounded-btn text-ink focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none disabled:opacity-50"
              />
              {editContentLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-canvas/60 rounded-btn">
                  <Loader2 className="animate-spin text-primary" size={20} />
                </div>
              )}
            </div>

            <label className="block text-sm font-medium text-ink-muted mb-2">Status</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setEditIsPublished(true)}
                className={`flex items-center gap-2 p-2.5 rounded-btn border text-left transition-all ${
                  editIsPublished ? 'border-primary bg-primary-soft' : 'border-border hover:bg-surface-hover'
                }`}
              >
                <Globe size={14} className="text-primary shrink-0" />
                <span className="text-xs font-medium text-ink">Publikasikan</span>
              </button>
              <button
                type="button"
                onClick={() => setEditIsPublished(false)}
                className={`flex items-center gap-2 p-2.5 rounded-btn border text-left transition-all ${
                  !editIsPublished ? 'border-primary bg-primary-soft' : 'border-border hover:bg-surface-hover'
                }`}
              >
                <Lock size={14} className="text-primary shrink-0" />
                <span className="text-xs font-medium text-ink">Draft</span>
              </button>
            </div>

            <label className="block text-sm font-medium text-ink-muted mb-2">Tema</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setEditTheme(t.id)}
                  className={`flex items-center gap-2 p-2 rounded-btn border text-left transition-all ${
                    editTheme === t.id ? 'border-primary bg-primary-soft' : 'border-border hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex -space-x-1 shrink-0">
                    {t.swatch.map((c, i) => (
                      <span key={i} className="w-3 h-3 rounded-full border border-white" style={{ background: c }} />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-ink truncate">{t.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={submitEditStory}
              disabled={savingEdit}
              className="w-full py-3 bg-primary hover:bg-primary-strong flex justify-center items-center gap-2 text-white rounded-btn font-medium transition-colors disabled:opacity-50"
            >
              {savingEdit ? <Loader2 className="animate-spin" size={18} /> : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      )}

      {/* Edit Poem Modal */}
      {editingPoem && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-10 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditingPoem(null)}
          />
          <div className="relative w-full max-w-lg my-8 bg-elevated border border-border rounded-card shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-bold text-ink">Edit Puisi</h3>
              <button onClick={() => setEditingPoem(null)} className="text-ink-muted hover:text-ink" aria-label="Tutup">
                <X size={20} />
              </button>
            </div>

            <label className="block text-sm font-medium text-ink-muted mb-2">Judul</label>
            <input
              type="text"
              value={editPoemTitle}
              onChange={(e) => setEditPoemTitle(e.target.value)}
              className="w-full p-3 mb-4 bg-canvas border border-border rounded-btn text-ink focus:outline-none focus:ring-2 focus:ring-primary/50"
            />

            {editPoemImageUrl ? (
              <>
                <label className="block text-sm font-medium text-ink-muted mb-2">Gambar</label>
                <div className="relative w-full mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={editPoemImageUrl} alt="Puisi" className="w-full max-h-56 object-contain rounded-btn border border-border" />
                  <button
                    type="button"
                    onClick={() => setEditPoemImageUrl(null)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-elevated shadow flex items-center justify-center text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <label className="block text-sm font-medium text-ink-muted mb-2">Isi Puisi</label>
                <textarea
                  value={editPoemContent}
                  onChange={(e) => setEditPoemContent(e.target.value)}
                  className="w-full h-40 p-3 mb-4 bg-canvas border border-border rounded-btn text-ink focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
                <label className="relative inline-flex items-center gap-2 text-xs font-medium text-primary-strong cursor-pointer mb-4">
                  <ImageIcon size={14} /> Ganti dengan gambar
                  <input type="file" accept="image/*" onChange={handleEditPoemImageChange} className="hidden" />
                </label>
              </>
            )}

            <label className="block text-sm font-medium text-ink-muted mb-2">Status</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setEditPoemIsPublished(true)}
                className={`flex items-center gap-2 p-2.5 rounded-btn border text-left transition-all ${
                  editPoemIsPublished ? 'border-primary bg-primary-soft' : 'border-border hover:bg-surface-hover'
                }`}
              >
                <Globe size={14} className="text-primary shrink-0" />
                <span className="text-xs font-medium text-ink">Publikasikan</span>
              </button>
              <button
                type="button"
                onClick={() => setEditPoemIsPublished(false)}
                className={`flex items-center gap-2 p-2.5 rounded-btn border text-left transition-all ${
                  !editPoemIsPublished ? 'border-primary bg-primary-soft' : 'border-border hover:bg-surface-hover'
                }`}
              >
                <Lock size={14} className="text-primary shrink-0" />
                <span className="text-xs font-medium text-ink">Draft</span>
              </button>
            </div>

            <label className="block text-sm font-medium text-ink-muted mb-2">Tema</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setEditPoemTheme(t.id)}
                  className={`flex items-center gap-2 p-2 rounded-btn border text-left transition-all ${
                    editPoemTheme === t.id ? 'border-primary bg-primary-soft' : 'border-border hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex -space-x-1 shrink-0">
                    {t.swatch.map((c, i) => (
                      <span key={i} className="w-3 h-3 rounded-full border border-white" style={{ background: c }} />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-ink truncate">{t.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={submitEditPoem}
              disabled={savingPoemEdit}
              className="w-full py-3 bg-primary hover:bg-primary-strong flex justify-center items-center gap-2 text-white rounded-btn font-medium transition-colors disabled:opacity-50"
            >
              {savingPoemEdit ? <Loader2 className="animate-spin" size={18} /> : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      )}

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </main>
  );
}
