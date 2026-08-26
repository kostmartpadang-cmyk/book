import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  const supabase = getServerSupabase(req);
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from('poems')
      .select('id, title, created_at, theme, image_url, content, user_id, is_published, profiles(display_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching poems:', error);
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
      return NextResponse.json({ error: 'Kamu harus masuk untuk menulis puisi' }, { status: 401 });
    }

    const { title, content, image_url, theme, is_published } = await req.json();

    if (!title || (!content?.trim() && !image_url)) {
      return NextResponse.json(
        { error: 'Judul wajib diisi, dan isi puisi atau gambar wajib salah satu' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('poems')
      .insert([
        {
          title,
          content: content || null,
          image_url: image_url || null,
          theme: theme || 'soft',
          user_id: user.id,
          is_published: is_published !== false,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error saving poem:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
