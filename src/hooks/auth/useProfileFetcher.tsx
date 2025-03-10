
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
        return
      }
      
      setFetchErrors(() => 0)
      
      if (data) {
        console.log("Profile data fetched:", data)
        setProfile(data as Profile)
      } else {
        console.log("No profile found for user", userId)
        try {
          console.log("Creating new profile for user:", userId)
          const userResult = await supabase.auth.getUser()
          if (userResult.data?.user) {
            const userData = userResult.data.user
            const userMeta = userData.user_metadata || {}
            const userType = userMeta?.user_type || 'patient'
            const fullName = userMeta?.full_name || userData.email?.split('@')[0] || 'User'
            
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert([{ 
                id: userId, 
                full_name: fullName,
                user_type: userType
              }])
              .select()
            
            if (insertError) {
              console.error("Error creating profile:", insertError)
              toast.error("Could not create user profile. Please try again.")
              throw insertError
            }
            
            if (newProfile && newProfile.length > 0) {
              console.log("New profile created:", newProfile[0])
              setProfile(newProfile[0] as Profile)
              toast.success("Welcome! Your profile has been created.")
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

  return { fetchProfile, isLoading }
}
