
import { createClient } from '@supabase/supabase-js'

// Using the provided Supabase URL and anon key
const supabaseUrl = 'https://vfjvxgwugdgfntjekzux.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmanZ4Z3d1Z2RnZm50amVrenV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNjQ2MzEsImV4cCI6MjA1Njk0MDYzMX0.bDgUyiud-Zdw8BFRsxIh4gV80zSykU8gBwq5gh9_JkM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const createUserProfile = async (userId: string, profileData: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ id: userId, ...profileData }])
    .select()

  if (error) throw error
  return data[0]
}

// Database schema helper functions
export const setupDatabaseSchema = async () => {
  // This function would normally be run once during app initialization
  // or as part of a database migration process
  
  // Example tables that would be created in Supabase:
  // 1. profiles - user profile information
  // 2. reports - medical reports
  // 3. consultations - doctor consultations
  // 4. medications - prescribed medications
  // 5. appointments - scheduled appointments
  
  console.log('Database schema is set up in Supabase dashboard')
}

// File storage helpers
export const getFileUrl = async (bucket: string, filePath: string) => {
  const { data } = await supabase
    .storage
    .from(bucket)
    .getPublicUrl(filePath)
    
  return data.publicUrl
}

// RLS policies should be set up in Supabase dashboard:
// Example policy for reports:
// - Users can only select their own reports
// - Users can insert their own reports
// - Users can update their own reports
// - Users can delete their own reports
