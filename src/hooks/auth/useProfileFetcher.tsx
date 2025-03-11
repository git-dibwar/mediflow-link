
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
          console.log("Creating profiles table...")
          await createProfilesTable()
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
            
            // Handle Google auth metadata more robustly
            const fullName = userMeta?.full_name || 
                           userMeta?.name || 
                           userData.email?.split('@')[0] || 
                           'User'
            
            // Default to patient unless explicitly set to another type
            const userType = userMeta?.user_type || 'patient'
            
            console.log("Creating new profile with:", {
              id: userId,
              full_name: fullName,
              user_type: userType,
              email: userData.email,
              avatar_url: userMeta?.avatar_url || userMeta?.picture
            })
            
            try {
              const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert([{ 
                  id: userId, 
                  full_name: fullName,
                  user_type: userType,
                  email: userData.email,
                  avatar_url: userMeta?.avatar_url || userMeta?.picture
                }])
                .select()
                .single()
              
              if (insertError) {
                console.error("Error creating profile:", insertError)
                
                // Check if the error is due to missing table
                if (insertError.code === '42P01') {
                  console.log("Profiles table doesn't exist, creating it...")
                  await createProfilesTable()
                  // Try creating profile again after creating the table
                  return fetchProfile(userId)
                }
                
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

  // Helper function to create profiles table if it doesn't exist
  const createProfilesTable = async () => {
    try {
      // This SQL creates the profile table if it doesn't exist
      const { error } = await supabase.rpc('create_profiles_table_if_not_exists')
      
      if (error) {
        console.error("Error creating profiles table:", error)
        return false
      }
      
      console.log("Profiles table created or already exists")
      return true
    } catch (error) {
      console.error("Error in createProfilesTable:", error)
      return false
    }
  }

  return { fetchProfile, isLoading }
}
