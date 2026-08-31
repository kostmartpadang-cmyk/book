import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseServer';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = getServerSupabase(req);
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
  }

  try {
    const { id } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: poem, error: poemError } = await supabase
      .from('poems')
      .select('user_id')
      .eq('id', id)
      .single();
    if (poemError) throw poemError;

    if (!user || user.id !== poem.user_id) {
      const { error } = await supabase.rpc('increment_poem_view', { p_poem_id: id });
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error recording poem view:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
