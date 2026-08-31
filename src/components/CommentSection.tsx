'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, Send, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: { display_name: string | null } | null;
}

interface CommentSectionProps {
  poemId?: string;
  storyId?: string;
  chapterId?: string; // only relevant with storyId; 'main' or a chapters.id uuid
}

export default function CommentSection({ poemId, storyId, chapterId }: CommentSectionProps) {
  const { user, authHeader } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetKey = poemId ? `poem:${poemId}` : `story:${storyId}:${chapterId || 'main'}`;

  const fetchComments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (poemId) {
        params.set('poem_id', poemId);
      } else if (storyId) {
        params.set('story_id', storyId);
        params.set('chapter_id', chapterId || 'main');
      }
      const res = await fetch(`/api/comments?${params.toString()}`, { headers: { ...authHeader() } });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setComments(data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [targetKey]);

  const submitComment = async () => {
    const content = text.trim();
    if (!content) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          poem_id: poemId,
          story_id: storyId,
          chapter_id: chapterId,
          content,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim komentar');
      setComments((prev) => [...prev, data]);
      setText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim komentar');
    } finally {
      setPosting(false);
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm('Hapus komentar ini?')) return;
    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE', headers: { ...authHeader() } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus komentar');
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus komentar');
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="mt-10 pt-8 border-t border-border">
      <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-ink mb-4">
        <MessageCircle size={18} className="text-primary" />
        Komentar <span className="text-ink-muted font-normal">({comments.length})</span>
      </h3>

      {user ? (
        <div className="mb-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tulis komentar..."
            rows={3}
            className="w-full p-3 bg-canvas border border-border rounded-btn text-ink text-sm placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          <div className="flex justify-end mt-2">
            <button
              onClick={submitComment}
              disabled={posting || !text.trim()}
              className="flex items-center gap-2 text-sm font-medium text-white bg-primary hover:bg-primary-strong px-4 py-2 rounded-btn transition-colors disabled:opacity-50"
            >
              {posting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              Kirim
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-ink-muted mb-6">Masuk untuk menulis komentar.</p>
      )}

      {loading ? (
        <p className="text-sm text-ink-muted">Memuat komentar...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-ink-muted">Belum ada komentar. Jadilah yang pertama!</p>
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-soft text-primary-strong flex items-center justify-center text-xs font-bold shrink-0">
                {(c.profiles?.display_name?.trim() || 'A')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink">
                    {c.profiles?.display_name?.trim() || 'Anonim'}
                    <span className="ml-2 text-xs text-ink-muted font-normal">{formatDate(c.created_at)}</span>
                  </p>
                  {user?.id === c.user_id && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      aria-label="Hapus komentar"
                      className="text-ink-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-ink-muted whitespace-pre-line mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
