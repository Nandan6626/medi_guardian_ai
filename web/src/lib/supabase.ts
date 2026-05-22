import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

if (supabaseUrl === 'https://placeholder.supabase.co') {
  console.error('CRITICAL: VITE_SUPABASE_URL is missing! Please create web/.env.local and add your Supabase credentials.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
