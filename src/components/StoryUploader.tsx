'use client';

import { useState, useRef } from 'react';
import { Upload, Type, FileText, Loader2, Save, Check, Image as ImageIcon, X, Globe, Lock } from 'lucide-react';
import { themes, DEFAULT_THEME } from '@/lib/themes';
import { resizeImageToDataUrl } from '@/lib/image';
import { useAuth } from './AuthProvider';

interface StoryUploaderProps {
  onStoryLoaded: (id: string, theme: string) => void;
}

export default function StoryUploader({ onStoryLoaded }: StoryUploaderProps) {
  const { user, authHeader } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'type'>('type');
  const [title, setTitle] = useState('');
  const [textInput, setTextInput] = useState('');
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
      <div className="w-full max-w-3xl mx-auto p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-emerald-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-sans text-center">
        <p className="text-emerald-800 font-semibold mb-1">Kamu harus masuk dulu</p>
        <p className="text-emerald-600/70 text-sm">Silakan masuk atau buat akun lewat sidebar untuk mulai menulis cerita.</p>
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

  const handleSubmitText = async () => {
    if (!title.trim()) {
      setError('Mohon isi judul cerita.');
      return;
    }
    if (!textInput.trim()) {
      setError('Isi cerita tidak boleh kosong.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const saved = await saveToSupabase(title, textInput);
      onStoryLoaded(saved.id, selectedTheme);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-emerald-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-sans">
      <div className="mb-6">
        <label className="block text-sm font-bold text-emerald-800 mb-2">Judul Cerita</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Masukkan judul cerita..." 
          className="w-full p-4 bg-white/80 border border-emerald-100 rounded-2xl text-emerald-900 placeholder:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-bold text-emerald-800 mb-2">Cover Cerita (opsional)</label>
        <div className="flex items-center gap-4">
          <div
            onClick={() => coverInputRef.current?.click()}
            className="relative w-20 h-28 shrink-0 rounded-xl border-2 border-dashed border-emerald-200 hover:border-emerald-500 bg-white/50 cursor-pointer flex items-center justify-center overflow-hidden transition-colors"
          >
            {coverProcessing ? (
              <Loader2 className="animate-spin text-emerald-600" size={20} />
            ) : coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="text-emerald-300" size={24} />
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs text-emerald-600/70 mb-2">
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
        <label className="block text-sm font-bold text-emerald-800 mb-2">Tema Tampilan Cerita</label>
        <p className="text-xs text-emerald-600/70 mb-3">Pilih nuansa yang dipakai saat cerita ini dibaca.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTheme(t.id)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                selectedTheme === t.id
                  ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                  : 'border-emerald-100 bg-white/60 hover:bg-emerald-50/60'
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
              <span className="text-xs font-semibold text-emerald-900 truncate flex-1">{t.label}</span>
              {selectedTheme === t.id && <Check size={14} className="text-emerald-600 shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-emerald-100 pb-4">
        <button
          onClick={() => setActiveTab('type')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
            activeTab === 'type' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-600 hover:bg-emerald-50'
          }`}
        >
          <Type size={18} /> Tulis Langsung
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
            activeTab === 'upload' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-600 hover:bg-emerald-50'
          }`}
        >
          <Upload size={18} /> Upload File (.docx/.pdf)
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-bold text-emerald-800 mb-2">Status</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsPublished(true)}
            className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
              isPublished ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-emerald-100 bg-white/60 hover:bg-emerald-50/60'
            }`}
          >
            <Globe size={16} className="text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-emerald-900">Publikasikan</div>
              <div className="text-[11px] text-emerald-600/70">Terlihat semua orang</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setIsPublished(false)}
            className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
              !isPublished ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-emerald-100 bg-white/60 hover:bg-emerald-50/60'
            }`}
          >
            <Lock size={16} className="text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-emerald-900">Draft</div>
              <div className="text-[11px] text-emerald-600/70">Cuma kamu yang lihat</div>
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'type' ? (
        <div className="space-y-4">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Tulis ceritamu di sini..."
            className="w-full h-64 p-5 bg-white/80 border border-emerald-100 rounded-2xl text-emerald-900 placeholder:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none shadow-inner"
          />
          {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl">{error}</p>}
          <button
            onClick={handleSubmitText}
            disabled={isProcessing}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 flex justify-center items-center gap-2 text-white rounded-2xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-600/30"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
            Simpan & Mulai Membaca
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-emerald-200 rounded-3xl p-16 text-center hover:border-emerald-500 hover:bg-emerald-50/50 transition-all cursor-pointer flex flex-col items-center justify-center bg-white/50"
            onClick={() => fileInputRef.current?.click()}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin text-emerald-600 mb-4" size={56} />
            ) : (
              <FileText className="text-emerald-400 mb-4" size={56} />
            )}
            <h3 className="text-2xl font-bold text-emerald-800 mb-2">
              {isProcessing ? 'Memproses File...' : 'Pilih file dokumen'}
            </h3>
            <p className="text-emerald-600 font-medium">
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
            <p className="text-red-500 text-center font-medium p-4 bg-red-50 border border-red-100 rounded-2xl">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
