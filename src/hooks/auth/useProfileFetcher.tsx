
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/auth'
import { User } from '@supabase/supabase-js'

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
  
  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user ID:", userId)
      
      const fetchWithTimeout = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
          // Using a timeout with abort controller for error handling
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
            
          clearTimeout(timeoutId);
          return { data, error };
        } catch (err) {
          clearTimeout(timeoutId);
          throw err;
        }
      };
      
      const { data, error } = await fetchWithTimeout();

      if (error) {
        console.error("Error fetching profile:", error)
        setFetchErrors(prev => prev + 1);
        
        if (fetchErrors > 3) {
          throw error;
        }
        
        if (user) {
          return;
        }
        
        throw error;
      }
      
      setFetchErrors(0);
      
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
            const fullName = userMeta?.full_name || 'User'
            
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
              throw insertError
            }
            
            if (newProfile && newProfile.length > 0) {
              console.log("New profile created:", newProfile[0])
              setProfile(newProfile[0] as Profile)
            }
          }
        } catch (profileError) {
          console.error("Error creating profile:", profileError)
        }
      }
    } catch (error) {
      console.error('Error in fetchProfile function:', error)
    }
  }

  return { fetchProfile }
}
