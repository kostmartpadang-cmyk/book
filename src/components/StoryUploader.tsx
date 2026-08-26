'use client';

import { useState, useRef } from 'react';
import { Upload, Type, FileText, Loader2, Save } from 'lucide-react';

interface StoryUploaderProps {
  onStoryLoaded: (text: string) => void;
}

export default function StoryUploader({ onStoryLoaded }: StoryUploaderProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'type'>('type');
  const [title, setTitle] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveToSupabase = async (storyTitle: string, storyContent: string) => {
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: storyTitle, content: storyContent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save to database');
      return data;
    } catch (err: any) {
      console.error(err);
      // We don't block reading if saving fails (e.g. Supabase keys missing), just log it
    }
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
      // 1. Parse the file
      const res = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membaca file');
      }

      // 2. Save to Supabase
      await saveToSupabase(title, data.text);

      // 3. Open in reader
      onStoryLoaded(data.text);
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
    
    await saveToSupabase(title, textInput);
    onStoryLoaded(textInput);
    setIsProcessing(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl">
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-400 mb-2">Judul Cerita</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Masukkan judul cerita..." 
          className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('type')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'type' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          <Type size={18} /> Tulis Langsung
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'upload' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          <Upload size={18} /> Upload File (.docx/.pdf)
        </button>
      </div>

      {activeTab === 'type' ? (
        <div className="space-y-4">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Tulis ceritamu di sini..."
            className="w-full h-64 p-4 bg-black/20 border border-white/10 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={handleSubmitText}
            disabled={isProcessing}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 flex justify-center items-center gap-2 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Simpan & Mulai Membaca
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer flex flex-col items-center justify-center"
            onClick={() => fileInputRef.current?.click()}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
            ) : (
              <FileText className="text-zinc-500 mb-4" size={48} />
            )}
            <h3 className="text-xl font-semibold text-zinc-200 mb-2">
              {isProcessing ? 'Memproses dan Menyimpan...' : 'Klik untuk upload file'}
            </h3>
            <p className="text-zinc-500 text-sm">
              Mendukung file .docx dan .pdf
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
            <p className="text-red-400 text-center text-sm p-3 bg-red-400/10 rounded-lg">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
