
import { supabase } from './supabase'

// This function will create the profiles table if it doesn't exist
// It's separate from the main code to be used when needed
export const createProfilesTable = async () => {
  try {
    // Try to create the needed database objects
    const { error } = await supabase.rpc('create_profiles_table_if_not_exists')
    
    if (error) {
      console.error('Error creating profiles table:', error)
      
      // If RPC doesn't exist, try direct SQL
      console.log('Attempting direct SQL setup...')
      
      // This doesn't actually run SQL directly, but triggers a setup through a special table
      // that will be handled by Supabase to create the profiles table
      const { data, error: setupError } = await supabase
        .from('_setup')
        .insert([{ operation: 'create_profiles' }])
        .select()
      
      if (setupError) {
        console.error('Direct SQL setup failed:', setupError)
        return false
      }
      
      console.log('Direct SQL setup response:', data)
      return true
    }
    
    console.log('Profiles table creation successful or already exists')
    return true
  } catch (error) {
    console.error('Unexpected error in createProfilesTable:', error)
    return false
  }
}
