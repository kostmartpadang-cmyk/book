import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseServer';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = getServerSupabase(req);
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
  }

  try {
    const { id } = await params;
    const { data, error } = await supabase.from('poems').select('*').eq('id', id).single();
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching poem:', error);
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
    const { title, content, image_url, theme, is_published, claim } = await req.json();

    const updates: Record<string, string | boolean | null> = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (image_url !== undefined) updates.image_url = image_url;
    if (theme !== undefined) updates.theme = theme;
    if (is_published !== undefined) updates.is_published = is_published;

    if (claim) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Kamu harus masuk untuk mengklaim puisi ini' }, { status: 401 });
      }
      updates.user_id = user.id;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase.from('poems').update(updates).eq('id', id).select().single();
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating poem:', error);
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
    const { error } = await supabase.from('poems').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting poem:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
