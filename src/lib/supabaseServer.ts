import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Creates a request-scoped Supabase client that forwards the caller's access
// token (if any), so Row Level Security policies relying on auth.uid() work
// correctly for that specific user instead of the shared anon key.
export function getServerSupabase(req: Request) {
  if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL_HERE' || !supabaseAnonKey) {
    return null;
  }

  const authHeader = req.headers.get('authorization');

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: authHeader ? { headers: { Authorization: authHeader } } : undefined,
    auth: { persistSession: false },
  });
}
