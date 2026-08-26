'use client';

import { useState, useRef } from 'react';
import { Type, Image as ImageIcon, Save, Check, Loader2, Globe, Lock, X } from 'lucide-react';
import { themes, DEFAULT_THEME } from '@/lib/themes';
import { resizeImageToDataUrl } from '@/lib/image';
import { useAuth } from './AuthProvider';

interface PoemUploaderProps {
  onSaved: (id: string) => void;
}

export default function PoemUploader({ onSaved }: PoemUploaderProps) {
  const { user, authHeader } = useAuth();
  const [activeTab, setActiveTab] = useState<'type' | 'image'>('type');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(DEFAULT_THEME);
  const [isPublished, setIsPublished] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-emerald-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-sans text-center">
        <p className="text-emerald-800 font-semibold mb-1">Kamu harus masuk dulu</p>
        <p className="text-emerald-600/70 text-sm">Silakan masuk atau buat akun lewat sidebar untuk menulis puisi.</p>
      </div>
    );
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageProcessing(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file, 900, 0.85);
      setImageUrl(dataUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImageProcessing(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Mohon isi judul puisi.');
      return;
    }
    if (activeTab === 'type' && !content.trim()) {
      setError('Isi puisi tidak boleh kosong.');
      return;
    }
    if (activeTab === 'image' && !imageUrl) {
      setError('Mohon upload gambar puisinya.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/poems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          title,
          content: activeTab === 'type' ? content : null,
          image_url: activeTab === 'image' ? imageUrl : null,
          theme: selectedTheme,
          is_published: isPublished,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan puisi');
      onSaved(data.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-emerald-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-sans">
      <div className="mb-6">
        <label className="block text-sm font-bold text-emerald-800 mb-2">Judul Puisi</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Masukkan judul puisi..."
          className="w-full p-4 bg-white/80 border border-emerald-100 rounded-2xl text-emerald-900 placeholder:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-bold text-emerald-800 mb-2">Tema Tampilan</label>
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
                  <span key={i} className="w-3.5 h-3.5 rounded-full border border-white" style={{ background: c }} />
                ))}
              </div>
              <span className="text-xs font-semibold text-emerald-900 truncate flex-1">{t.label}</span>
              {selectedTheme === t.id && <Check size={14} className="text-emerald-600 shrink-0" />}
            </button>
          ))}
        </div>
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
          onClick={() => setActiveTab('image')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
            activeTab === 'image' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-600 hover:bg-emerald-50'
          }`}
        >
          <ImageIcon size={18} /> Upload Gambar
        </button>
      </div>

      {activeTab === 'type' ? (
        <div className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={'Tulis puisimu di sini...'}
            className="w-full h-64 p-5 bg-white/80 border border-emerald-100 rounded-2xl text-emerald-900 placeholder:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none shadow-inner"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div
            onClick={() => imageInputRef.current?.click()}
            className="relative border-2 border-dashed border-emerald-200 rounded-3xl p-8 text-center hover:border-emerald-500 hover:bg-emerald-50/50 transition-all cursor-pointer flex flex-col items-center justify-center bg-white/50 min-h-[220px] overflow-hidden"
          >
            {imageProcessing ? (
              <Loader2 className="animate-spin text-emerald-600" size={48} />
            ) : imageUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Puisi" className="max-h-64 rounded-xl object-contain" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setImageUrl(null); }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-red-500"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <ImageIcon className="text-emerald-400 mb-4" size={48} />
                <h3 className="text-lg font-bold text-emerald-800 mb-1">Klik untuk upload gambar</h3>
                <p className="text-emerald-600 text-sm">Foto atau desain puisimu</p>
              </>
            )}
            <input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl mt-4">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={isProcessing}
        className="w-full mt-4 py-4 bg-emerald-600 hover:bg-emerald-700 flex justify-center items-center gap-2 text-white rounded-2xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-600/30"
      >
        {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
        Simpan Puisi
      </button>
    </div>
  );
}
