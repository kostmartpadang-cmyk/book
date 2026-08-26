'use client';

import { useState, useEffect } from 'react';
import StoryUploader from '@/components/StoryUploader';
import StoryReader from '@/components/StoryReader';
import { BookOpen } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function Home() {
  const [storyText, setStoryText] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);

  useEffect(() => {
    fetchStories();
  }, [storyText]); // Refresh stories when storyText changes (meaning a new one might have been added)

  const fetchStories = async () => {
    try {
      setLoadingStories(true);
      const res = await fetch('/api/stories');
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

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30 pb-20">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2000')] bg-cover bg-center opacity-10 pointer-events-none fixed" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {!storyText ? (
          <div className="flex-1 p-6 mt-12 md:mt-0">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
                Ruang Cerita
              </h1>
              <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed mb-12">
                Tulis karyamu atau unggah dokumen Word/PDF. Nikmati pengalaman membaca dengan berbagai efek visual yang imersif.
              </p>
            </div>
            
            <StoryUploader onStoryLoaded={(text) => setStoryText(text)} />

            {/* Gallery Section */}
            <div className="max-w-4xl mx-auto mt-24">
              <div className="flex items-center gap-3 mb-8">
                <BookOpen className="text-indigo-400" size={28} />
                <h2 className="text-3xl font-bold text-zinc-100">Galeri Cerita</h2>
              </div>
              
              {loadingStories ? (
                <div className="text-zinc-500 animate-pulse">Memuat cerita...</div>
              ) : stories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stories.map((story) => (
                    <div 
                      key={story.id} 
                      className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col h-48"
                      onClick={() => setStoryText(story.content)}
                    >
                      <h3 className="text-xl font-semibold text-zinc-200 mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">
                        {story.title}
                      </h3>
                      <p className="text-zinc-500 text-sm mb-4">
                        {new Date(story.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                      <div className="mt-auto text-indigo-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Baca sekarang →
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-zinc-500 text-center py-12 border border-dashed border-white/10 rounded-2xl">
                  Belum ada cerita yang tersimpan di database.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-12 px-4">
            <StoryReader text={storyText} onBack={() => setStoryText(null)} />
          </div>
        )}
      </div>
    </main>
  );
}
