import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseServer';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = getServerSupabase(req);
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
  }

  try {
    const { id } = await params;
    const { title, content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Isi bab tidak boleh kosong' }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabase
      .from('chapters')
      .select('chapter_number')
      .eq('story_id', id)
      .order('chapter_number', { ascending: false })
      .limit(1);
    if (existingError) throw existingError;

    const nextNumber = (existing?.[0]?.chapter_number ?? 1) + 1;

    const { data, error } = await supabase
      .from('chapters')
      .insert([{ story_id: id, chapter_number: nextNumber, title: title || `Bab ${nextNumber}`, content }])
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error adding chapter:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
