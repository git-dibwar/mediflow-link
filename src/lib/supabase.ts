
import { createClient } from '@supabase/supabase-js'

// Using the provided Supabase URL and anon key
const supabaseUrl = 'https://vfjvxgwugdgfntjekzux.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmanZ4Z3d1Z2RnZm50amVrenV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNjQ2MzEsImV4cCI6MjA1Njk0MDYzMX0.bDgUyiud-Zdw8BFRsxIh4gV80zSykU8gBwq5gh9_JkM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
