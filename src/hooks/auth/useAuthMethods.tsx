
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { UserType, Profile } from '@/types/auth'
import { User, Session } from '@supabase/supabase-js'
import { useState } from 'react'

type AuthMethodsProps = {
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  fetchProfile: (userId: string) => Promise<void>
}

export const useAuthMethods = ({ 
  setUser, 
  setSession, 
  setProfile, 
  fetchProfile 
}: AuthMethodsProps) => {
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setSession(null)
      setProfile(null)
      
      // Clear any local storage/cache that might be causing persistence issues
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('mediflow-auth')
      
      toast.success('Signed out successfully')
    } catch (error: any) {
      console.error('Error signing out:', error)
      toast.error(error.message || 'Failed to sign out')
      
      // Force reset state even if signout API fails
      setUser(null)
      setSession(null)
      setProfile(null)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setIsAuthLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      if (error) throw error
    } catch (error: any) {
      console.error('Error signing in with Google:', error)
      toast.error(error.message || 'Failed to sign in with Google')
    } finally {
      setIsAuthLoading(false)
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsAuthLoading(true)
      console.log("Signing in with email:", email)
      
      // First clear any potentially problematic auth state
      await supabase.auth.signOut()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error("Sign in error:", error)
        throw error
      }
      
      console.log("Sign in successful, data:", data)
      
      if (!data.session) {
        throw new Error("No session returned after login")
      }
      
      setSession(data.session)
      setUser(data.user)
      
      if (data.user) {
        console.log("Fetching profile for user after sign in:", data.user.id)
        await fetchProfile(data.user.id)
      }
      
      toast.success('Signed in successfully')
      return { error: null, success: true }
    } catch (error: any) {
      console.error('Error signing in:', error)
      
      let errorMessage = 'Failed to sign in'
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password'
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please try again later.'
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
      return { error, success: false }
    } finally {
      setIsAuthLoading(false)
    }
  }

  const signUpWithEmail = async (email: string, password: string, fullName: string, userType: UserType) => {
    try {
      setIsAuthLoading(true)
      console.log("Signing up with email:", email, "userType:", userType)
      
      // First clear any potentially problematic auth state
      await supabase.auth.signOut()
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: userType
          }
        }
      })
      
      if (error) {
        console.error("Sign up error:", error)
        throw error
      }
      
      console.log("Sign up successful, data:", data)
      
      // For improved UX, immediately set the session and user if available
      if (data.session) {
        setSession(data.session)
        setUser(data.user)
        
        // Some Supabase instances may not require email verification
        if (data.user) {
          console.log("Fetching profile for new user:", data.user.id)
          await fetchProfile(data.user.id)
        }
      }
      
      toast.success('Account created successfully! Please check your email for verification.')
      return { error: null, success: true }
    } catch (error: any) {
      console.error('Error signing up:', error)
      
      let errorMessage = 'Failed to sign up'
      if (error.message?.includes('email already registered')) {
        errorMessage = 'This email is already registered. Please try signing in instead.'
      } else if (error.message?.includes('password')) {
        errorMessage = 'Password is too weak. Please use at least 6 characters.'
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
      return { error, success: false }
    } finally {
      setIsAuthLoading(false)
    }
  }

  return {
    signOut,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    isAuthLoading
  }
}
