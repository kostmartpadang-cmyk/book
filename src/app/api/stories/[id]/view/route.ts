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

    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('user_id')
      .eq('id', id)
      .single();
    if (storyError) throw storyError;

    if (!user || user.id !== story.user_id) {
      const { error } = await supabase.rpc('increment_story_view', { p_story_id: id });
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error recording story view:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
