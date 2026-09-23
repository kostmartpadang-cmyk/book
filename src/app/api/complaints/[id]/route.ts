import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseServer';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = getServerSupabase(req);
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
  }

  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from('complaints')
      .select('*, profiles(display_name)')
      .eq('id', id)
      .single();
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching complaint:', error);
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
    const { content, is_published } = await req.json();

    const updates: Record<string, string | boolean> = {};
    if (content !== undefined) updates.content = content;
    if (is_published !== undefined) updates.is_published = is_published;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase.from('complaints').update(updates).eq('id', id).select().single();
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating complaint:', error);
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
    const { error } = await supabase.from('complaints').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting complaint:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
