
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hucnlvxnwazlqukzsvdb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1Y25sdnhud2F6bHF1a3pzdmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0MTk4NjQsImV4cCI6MjA1Njk5NTg2NH0.TLVa7nRFMpbBxQsCRGtXwx-sUfKTzTLGUohyxhRp6KI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});
