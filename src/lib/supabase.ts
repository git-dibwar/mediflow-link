
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

// Using the provided Supabase URL and anon key
const supabaseUrl = 'https://vfjvxgwugdgfntjekzux.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmanZ4Z3d1Z2RnZm50amVrenV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNjQ2MzEsImV4cCI6MjA1Njk0MDYzMX0.bDgUyiud-Zdw8BFRsxIh4gV80zSykU8gBwq5gh9_JkM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  return user
}

export const createUserProfile = async (userId: string, profileData: any) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ id: userId, ...profileData }])
      .select()

    if (error) throw error
    return data[0]
  } catch (error: any) {
    console.error('Error creating user profile:', error)
    toast.error('Failed to create user profile')
    return null
  }
}

// Get user profile
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    console.error('Error getting user profile:', error)
    return null
  }
}

// Update user profile
export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()

    if (error) throw error
    toast.success('Profile updated successfully')
    return data[0]
  } catch (error: any) {
    console.error('Error updating user profile:', error)
    toast.error('Failed to update profile')
    return null
  }
}

// Get user organization
export const getUserOrganization = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle()

    if (error) throw error
    return data
  } catch (error: any) {
    console.error('Error getting organization:', error)
    return null
  }
}

// Create or update organization
export const upsertOrganization = async (organization: any) => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .upsert(organization)
      .select()

    if (error) throw error
    toast.success('Organization information saved successfully')
    return data[0]
  } catch (error: any) {
    console.error('Error saving organization:', error)
    toast.error('Failed to save organization information')
    return null
  }
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
  try {
    const { data } = await supabase
      .storage
      .from(bucket)
      .getPublicUrl(filePath)
      
    return data.publicUrl
  } catch (error: any) {
    console.error('Error getting file URL:', error)
    return null
  }
}

// Upload file to storage
export const uploadFile = async (bucket: string, filePath: string, file: File) => {
  try {
    // Ensure path includes user ID for security
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    // Create a path that includes the user ID
    const securePath = `${user.id}/${filePath}`
    
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(securePath, file, {
        cacheControl: '3600',
        upsert: true
      })
      
    if (error) throw error
    toast.success('File uploaded successfully')
    return { ...data, path: securePath }
  } catch (error: any) {
    console.error('Error uploading file:', error)
    toast.error('Failed to upload file: ' + error.message)
    return null
  }
}

// Download a file
export const downloadFile = async (bucket: string, filePath: string, fileName: string) => {
  try {
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .download(filePath)
      
    if (error) throw error
    
    // Create a download link
    const url = URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    return true
  } catch (error: any) {
    console.error('Error downloading file:', error)
    toast.error('Failed to download file')
    return false
  }
}

// Delete a file
export const deleteFile = async (bucket: string, filePath: string) => {
  try {
    const { error } = await supabase
      .storage
      .from(bucket)
      .remove([filePath])
      
    if (error) throw error
    toast.success('File deleted successfully')
    return true
  } catch (error: any) {
    console.error('Error deleting file:', error)
    toast.error('Failed to delete file')
    return false
  }
}
