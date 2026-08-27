import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseServer';
import { sanitizeHtml } from '@/lib/richtext';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  const supabase = getServerSupabase(req);
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
  }

  try {
    const { id, chapterId } = await params;
    const { title, content, chapter_number } = await req.json();

    const updates: Record<string, string | number> = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = sanitizeHtml(content);
    if (chapter_number !== undefined) updates.chapter_number = chapter_number;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('chapters')
      .update(updates)
      .eq('id', chapterId)
      .eq('story_id', id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating chapter:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  const supabase = getServerSupabase(req);
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
  }

  try {
    const { id, chapterId } = await params;
    const { error } = await supabase.from('chapters').delete().eq('id', chapterId).eq('story_id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting chapter:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
