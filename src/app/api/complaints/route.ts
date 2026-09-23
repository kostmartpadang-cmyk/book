import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  const supabase = getServerSupabase(req);
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('id, content, created_at, user_id, is_published, profiles(display_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching complaints:', error);
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
      return NextResponse.json({ error: 'Kamu harus masuk untuk curhat' }, { status: 401 });
    }

    const { content, is_published } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Isi keluh kesah tidak boleh kosong' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('complaints')
      .insert([
        {
          content,
          user_id: user.id,
          is_published: is_published === true,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error saving complaint:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
