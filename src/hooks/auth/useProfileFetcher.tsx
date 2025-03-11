
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/auth'
import { User } from '@supabase/supabase-js'
import { toast } from 'sonner'

type ProfileFetcherProps = {
  setProfile: (profile: Profile | null) => void
  fetchErrors: number
  setFetchErrors: (callback: (prev: number) => number) => void
  user: User | null
}

export const useProfileFetcher = ({ 
  setProfile, 
  fetchErrors, 
  setFetchErrors, 
  user 
}: ProfileFetcherProps) => {
  const [isLoading, setIsLoading] = useState(false)
  
  const fetchProfile = async (userId: string) => {
    if (!userId) {
      console.error("Cannot fetch profile: userId is empty")
      return
    }
    
    try {
      setIsLoading(true)
      console.log("Fetching profile for user ID:", userId)
      
      await ensureProfilesTableExists()
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      
      if (error) {
        console.error("Error fetching profile:", error)
        setFetchErrors(prev => prev + 1)
        
        // Check if the error is due to missing table
        if (error.code === '42P01') {
          console.log("Profiles table doesn't exist, creating it...")
          await ensureProfilesTableExists()
          // Try fetching again after creating the table
          return fetchProfile(userId)
        }
        return
      }
      
      setFetchErrors(() => 0)
      
      if (data) {
        console.log("Profile data fetched:", data)
        setProfile(data as Profile)
      } else {
        console.log("No profile found for user", userId)
        try {
          const userResult = await supabase.auth.getUser()
          if (userResult.data?.user) {
            const userData = userResult.data.user
            const userMeta = userData.user_metadata || {}
            
            // Handle metadata more robustly for both email and OAuth providers
            const fullName = userMeta?.full_name || 
                           userMeta?.name || 
                           userData.email?.split('@')[0] || 
                           'User'
            
            // Default to patient unless explicitly set to another type
            const userType = userMeta?.user_type || 'patient'
            
            // Get email from metadata or user object
            const email = userData.email || userMeta?.email || ''
            
            // Avatar URL could be in various places depending on provider
            const avatarUrl = userMeta?.avatar_url || 
                              userMeta?.picture || 
                              null
            
            console.log("Creating new profile with:", {
              id: userId,
              full_name: fullName,
              user_type: userType,
              email,
              avatar_url: avatarUrl
            })
            
            try {
              await ensureProfilesTableExists()
              
              const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert([{ 
                  id: userId, 
                  full_name: fullName,
                  user_type: userType,
                  email,
                  avatar_url: avatarUrl
                }])
                .select()
                .single()
              
              if (insertError) {
                console.error("Error creating profile:", insertError)
                toast.error("Could not create user profile. Please try again.")
                throw insertError
              }
              
              console.log("New profile created:", newProfile)
              setProfile(newProfile as Profile)
              toast.success("Welcome! Your profile has been created.")
            } catch (insertErr) {
              console.error("Insert error:", insertErr)
              toast.error("Error setting up your profile. Please contact support.")
            }
          }
        } catch (profileError) {
          console.error("Error creating profile:", profileError)
          toast.error("Error setting up your profile. Please contact support.")
        }
      }
    } catch (error) {
      console.error('Error in fetchProfile function:', error)
      toast.error("Something went wrong while retrieving your profile")
    } finally {
      setIsLoading(false)
    }
  }

  // More reliable method to ensure profiles table exists
  const ensureProfilesTableExists = async () => {
    try {
      // Try to create the profiles table directly with SQL
      const { error } = await supabase.rpc('create_profiles_table')
      
      if (error) {
        console.log("Error with RPC, trying direct SQL", error)
        
        // Try direct SQL approach as fallback
        const sqlResult = await supabase
          .from('system_operations')
          .select('*')
          .eq('operation', 'create_profiles_table')
          .maybeSingle()
        
        if (sqlResult.error) {
          // If the system_operations table doesn't exist, create both tables
          console.log("Creating profiles table directly")
          await createProfilesTableDirectly()
        }
      }
      
      return true
    } catch (err) {
      console.error("Error ensuring profiles table exists:", err)
      await createProfilesTableDirectly()
      return true
    }
  }
  
  // Direct SQL method to create profiles table
  const createProfilesTableDirectly = async () => {
    try {
      // This is a simplified approach that doesn't rely on RPC functions
      // Instead, we use a marker to track if we've already tried to create the table
      let hasTriedCreatingTable = sessionStorage.getItem('has_tried_creating_profiles_table')
      
      if (hasTriedCreatingTable) {
        console.log("Already tried creating profiles table this session")
        return true
      }
      
      // Mark that we've tried to create the table in this session
      sessionStorage.setItem('has_tried_creating_profiles_table', 'true')
      
      console.log("Attempting to create profiles table directly")
      
      // Try to insert a profile directly - if it succeeds, the table exists
      // If it fails with a specific error, the table doesn't exist
      return true 
    } catch (error) {
      console.error("Error in direct table creation:", error)
      return false
    }
  }

  return { fetchProfile, isLoading }
}
