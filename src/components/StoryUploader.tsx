'use client';

import { useState, useRef } from 'react';
import { Upload, Type, FileText, Loader2, Save, Check, Image as ImageIcon, X, Globe, Lock, Plus, Pencil, ArrowLeft, Trash2 } from 'lucide-react';
import { themes, DEFAULT_THEME } from '@/lib/themes';
import { resizeImageToDataUrl } from '@/lib/image';
import { countWords, isContentEmpty } from '@/lib/richtext';
import { useAuth } from './AuthProvider';
import RichTextEditor from './RichTextEditor';

interface StoryUploaderProps {
  onStoryLoaded: (id: string, theme: string) => void;
}

interface DraftChapter {
  title: string;
  content: string;
}

export default function StoryUploader({ onStoryLoaded }: StoryUploaderProps) {
  const { user, authHeader } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'type'>('type');
  const [title, setTitle] = useState('');
  const [draftChapters, setDraftChapters] = useState<DraftChapter[]>([{ title: 'Bab 1', content: '' }]);
  const [composerIndex, setComposerIndex] = useState<number | null>(null);
  const [composerTitle, setComposerTitle] = useState('');
  const [composerContent, setComposerContent] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(DEFAULT_THEME);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverProcessing, setCoverProcessing] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="w-full max-w-3xl mx-auto p-8 bg-surface backdrop-blur-xl rounded-card border border-border shadow-card font-body text-center">
        <p className="text-ink font-semibold mb-1">Kamu harus masuk dulu</p>
        <p className="text-ink-muted text-sm">Silakan masuk atau buat akun lewat sidebar untuk mulai menulis cerita.</p>
      </div>
    );
  }

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverProcessing(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file, 500, 0.82);
      setCoverUrl(dataUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCoverProcessing(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const saveToSupabase = async (storyTitle: string, storyContent: string) => {
    const res = await fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({
        title: storyTitle,
        content: storyContent,
        theme: selectedTheme,
        cover_url: coverUrl,
        is_published: isPublished,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save to database');
    return data;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!title.trim()) {
      setError('Mohon isi judul cerita terlebih dahulu sebelum upload.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membaca file');
      }

      const saved = await saveToSupabase(title, data.text);
      onStoryLoaded(saved.id, selectedTheme);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openComposer = (index: number) => {
    setComposerIndex(index);
    setComposerTitle(draftChapters[index].title);
    setComposerContent(draftChapters[index].content);
  };

  const closeComposerSave = () => {
    if (composerIndex === null) return;
    setDraftChapters((prev) =>
      prev.map((c, i) => (i === composerIndex ? { title: composerTitle || `Bab ${i + 1}`, content: composerContent } : c))
    );
    setComposerIndex(null);
  };

  const addChapter = () => {
    const nextIndex = draftChapters.length;
    setDraftChapters((prev) => [...prev, { title: `Bab ${nextIndex + 1}`, content: '' }]);
    openComposer(nextIndex);
  };

  const removeChapter = (index: number) => {
    if (draftChapters.length <= 1) return;
    setDraftChapters((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitText = async () => {
    if (!title.trim()) {
      setError('Mohon isi judul cerita.');
      return;
    }
    if (isContentEmpty(draftChapters[0]?.content || '')) {
      setError('Isi Bab 1 tidak boleh kosong.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const saved = await saveToSupabase(title, draftChapters[0].content);

      // Save any additional chapters written before submitting.
      for (const chapter of draftChapters.slice(1)) {
        if (isContentEmpty(chapter.content)) continue;
        await fetch(`/api/stories/${saved.id}/chapters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          body: JSON.stringify({ title: chapter.title, content: chapter.content }),
        });
      }

      onStoryLoaded(saved.id, selectedTheme);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Full-page chapter composer — easier to type on mobile than a small modal textarea.
  if (composerIndex !== null) {
    return (
      <div data-theme={selectedTheme} className="fixed inset-0 z-[70] bg-elevated flex flex-col font-body">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border shrink-0">
          <button
            onClick={closeComposerSave}
            className="flex items-center gap-2 text-ink-muted hover:text-ink font-medium"
          >
            <ArrowLeft size={20} /> Selesai
          </button>
          <input
            type="text"
            value={composerTitle}
            onChange={(e) => setComposerTitle(e.target.value)}
            placeholder="Judul bab..."
            className="flex-1 mx-4 text-center font-bold text-ink placeholder:text-ink-muted focus:outline-none"
          />
          <span className="text-xs text-ink-muted shrink-0">
            {countWords(composerContent)} kata
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <RichTextEditor
            key={composerIndex}
            value={composerContent}
            onChange={setComposerContent}
            placeholder="Tulis isi bab di sini..."
            autoFocus
            toolbarClassName="sticky top-0 z-10"
            className="text-ink placeholder:text-ink-muted focus:outline-none text-base sm:text-lg leading-relaxed min-h-[50vh] [&_p]:mb-4"
          />
        </div>
      </div>
    );
  }

  return (
    <div data-theme={selectedTheme} className="w-full max-w-3xl mx-auto p-8 bg-surface backdrop-blur-xl rounded-card border border-border shadow-card font-body">
      <div className="mb-6">
        <label className="block text-sm font-bold text-ink mb-2">Judul Cerita</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Masukkan judul cerita..."
          className="w-full p-4 bg-elevated border border-border rounded-btn text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-bold text-ink mb-2">Cover Cerita (opsional)</label>
        <div className="flex items-center gap-4">
          <div
            onClick={() => coverInputRef.current?.click()}
            className="relative w-20 h-28 shrink-0 rounded-btn border-2 border-dashed border-border hover:border-primary bg-canvas cursor-pointer flex items-center justify-center overflow-hidden transition-colors"
          >
            {coverProcessing ? (
              <Loader2 className="animate-spin text-primary" size={20} />
            ) : coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="text-ink-muted" size={24} />
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs text-ink-muted mb-2">
              Gambar sampul yang muncul di rak & katalog. Kalau kosong, dipakai sampul warna polos sesuai tema.
            </p>
            {coverUrl && (
              <button
                type="button"
                onClick={() => setCoverUrl(null)}
                className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600"
              >
                <X size={12} /> Hapus cover
              </button>
            )}
          </div>
          <input
            type="file"
            ref={coverInputRef}
            onChange={handleCoverChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-bold text-ink mb-2">Tema Tampilan Cerita</label>
        <p className="text-xs text-ink-muted mb-3">Pilih nuansa yang dipakai saat cerita ini dibaca.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTheme(t.id)}
              className={`flex items-center gap-2 p-2.5 rounded-btn border text-left transition-all ${
                selectedTheme === t.id
                  ? 'border-primary bg-primary-soft ring-1 ring-primary'
                  : 'border-border bg-elevated hover:bg-surface-hover'
              }`}
            >
              <div className="flex -space-x-1 shrink-0">
                {t.swatch.map((c, i) => (
                  <span
                    key={i}
                    className="w-3.5 h-3.5 rounded-full border border-white"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-ink truncate flex-1">{t.label}</span>
              {selectedTheme === t.id && <Check size={14} className="text-primary-strong shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-border pb-4">
        <button
          onClick={() => setActiveTab('type')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-btn font-semibold transition-all ${
            activeTab === 'type' ? 'bg-primary text-white shadow-md' : 'text-ink-muted hover:bg-surface-hover'
          }`}
        >
          <Type size={18} /> Tulis Langsung
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-btn font-semibold transition-all ${
            activeTab === 'upload' ? 'bg-primary text-white shadow-md' : 'text-ink-muted hover:bg-surface-hover'
          }`}
        >
          <Upload size={18} /> Upload File (.docx/.pdf)
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-bold text-ink mb-2">Status</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsPublished(true)}
            className={`flex items-center gap-2 p-3 rounded-btn border text-left transition-all ${
              isPublished ? 'border-primary bg-primary-soft ring-1 ring-primary' : 'border-border bg-elevated hover:bg-surface-hover'
            }`}
          >
            <Globe size={16} className="text-primary shrink-0" />
            <div>
              <div className="text-xs font-semibold text-ink">Publikasikan</div>
              <div className="text-[11px] text-ink-muted">Terlihat semua orang</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setIsPublished(false)}
            className={`flex items-center gap-2 p-3 rounded-btn border text-left transition-all ${
              !isPublished ? 'border-primary bg-primary-soft ring-1 ring-primary' : 'border-border bg-elevated hover:bg-surface-hover'
            }`}
          >
            <Lock size={16} className="text-primary shrink-0" />
            <div>
              <div className="text-xs font-semibold text-ink">Draft</div>
              <div className="text-[11px] text-ink-muted">Cuma kamu yang lihat</div>
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'type' ? (
        <div className="space-y-4">
          <label className="block text-sm font-bold text-ink mb-2">Bab Cerita</label>
          <div className="space-y-2">
            {draftChapters.map((chapter, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-elevated border border-border rounded-btn"
              >
                <button
                  onClick={() => openComposer(i)}
                  className="flex-1 flex items-center gap-3 text-left min-w-0"
                >
                  <div className="w-9 h-9 rounded-btn bg-primary-soft text-primary-strong flex items-center justify-center shrink-0">
                    <Pencil size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{chapter.title || `Bab ${i + 1}`}</p>
                    <p className="text-xs text-ink-muted truncate">
                      {!isContentEmpty(chapter.content)
                        ? `${countWords(chapter.content)} kata`
                        : i === 0
                          ? 'Belum ditulis (wajib diisi)'
                          : 'Belum ditulis'}
                    </p>
                  </div>
                </button>
                {draftChapters.length > 1 && (
                  <button
                    onClick={() => removeChapter(i)}
                    className="text-red-400 hover:text-red-600 shrink-0"
                    aria-label="Hapus bab"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addChapter}
              className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 rounded-btn text-ink-muted font-medium text-sm transition-all"
            >
              <Plus size={16} /> Tambah Bab
            </button>
          </div>

          {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-btn">{error}</p>}
          <button
            onClick={handleSubmitText}
            disabled={isProcessing}
            className="w-full py-4 bg-primary hover:bg-primary-strong flex justify-center items-center gap-2 text-white rounded-btn font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-card"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
            Simpan & Mulai Membaca
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-border rounded-card p-16 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center bg-canvas"
            onClick={() => fileInputRef.current?.click()}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin text-primary mb-4" size={56} />
            ) : (
              <FileText className="text-ink-muted mb-4" size={56} />
            )}
            <h3 className="text-2xl font-bold text-ink mb-2">
              {isProcessing ? 'Memproses File...' : 'Pilih file dokumen'}
            </h3>
            <p className="text-ink-muted font-medium">
              Mendukung format .docx dan .pdf
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".docx,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
              className="hidden"
            />
          </div>
          {error && (
            <p className="text-red-500 text-center font-medium p-4 bg-red-50 border border-red-100 rounded-card">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
