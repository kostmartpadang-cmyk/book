import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  const supabase = getServerSupabase(req);
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const poemId = searchParams.get('poem_id');
    const storyId = searchParams.get('story_id');
    const chapterId = searchParams.get('chapter_id'); // 'main' or a chapters.id uuid, only used with story_id

    if (!poemId && !storyId) {
      return NextResponse.json({ error: 'poem_id or story_id is required' }, { status: 400 });
    }

    let query = supabase
      .from('comments')
      .select('id, content, created_at, user_id, profiles(display_name)')
      .order('created_at', { ascending: true });

    if (poemId) {
      query = query.eq('poem_id', poemId);
    } else {
      query = query.eq('story_id', storyId as string);
      if (chapterId && chapterId !== 'main') {
        query = query.eq('chapter_id', chapterId);
      } else {
        query = query.is('chapter_id', null);
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = getServerSupabase(req);
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Kamu harus masuk untuk berkomentar' }, { status: 401 });
    }

    const { poem_id, story_id, chapter_id, content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Komentar tidak boleh kosong' }, { status: 400 });
    }
    if (!poem_id && !story_id) {
      return NextResponse.json({ error: 'poem_id or story_id is required' }, { status: 400 });
    }

    const insert: Record<string, string> = {
      user_id: user.id,
      content: content.trim(),
    };
    if (poem_id) {
      insert.poem_id = poem_id;
    } else {
      insert.story_id = story_id;
      if (chapter_id && chapter_id !== 'main') insert.chapter_id = chapter_id;
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([insert])
      .select('id, content, created_at, user_id, profiles(display_name)')
      .single();
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
