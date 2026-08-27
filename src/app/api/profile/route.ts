import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseServer';

export async function PATCH(req: NextRequest) {
  const supabase = getServerSupabase(req);
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Kamu harus masuk untuk mengubah profil' }, { status: 401 });
    }

    const { display_name } = await req.json();
    const name = typeof display_name === 'string' ? display_name.trim() : '';
    if (!name) {
      return NextResponse.json({ error: 'Nama tidak boleh kosong' }, { status: 400 });
    }
    if (name.length > 80) {
      return NextResponse.json({ error: 'Nama maksimal 80 karakter' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ display_name: name })
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
