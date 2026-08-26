import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseServer';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = getServerSupabase(req);
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
  }

  try {
    const { id } = await params;

    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', id)
      .single();
    if (storyError) throw storyError;

    const { data: extraChapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('id, chapter_number, title, content')
      .eq('story_id', id)
      .order('chapter_number', { ascending: true });
    if (chaptersError) throw chaptersError;

    const chapters = [
      { id: 'main', number: 1, title: story.title, content: story.content },
      ...(extraChapters || []).map((c) => ({
        id: c.id,
        number: c.chapter_number,
        title: c.title || `Bab ${c.chapter_number}`,
        content: c.content,
      })),
    ];

    return NextResponse.json({ ...story, chapters });
  } catch (error: any) {
    console.error('Error fetching story:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = getServerSupabase(req);
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
  }

  try {
    const { id } = await params;
    const { title, theme, content, cover_url, is_published, claim } = await req.json();

    const updates: Record<string, string | boolean | null> = {};
    if (title !== undefined) updates.title = title;
    if (theme !== undefined) updates.theme = theme;
    if (content !== undefined) updates.content = content;
    if (cover_url !== undefined) updates.cover_url = cover_url;
    if (is_published !== undefined) updates.is_published = is_published;

    if (claim) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Kamu harus masuk untuk mengklaim cerita ini' }, { status: 401 });
      }
      updates.user_id = user.id;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('stories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating story:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = getServerSupabase(req);
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
  }

  try {
    const { id } = await params;
    const { error } = await supabase.from('stories').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting story:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
