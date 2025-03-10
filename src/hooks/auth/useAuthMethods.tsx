
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { UserType, Profile } from '@/types/auth'
import { User, Session } from '@supabase/supabase-js'

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
  
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setSession(null)
      setProfile(null)
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            prompt: 'select_account' // Force account selection instead of auto-login
          }
        }
      })
      if (error) throw error
    } catch (error: any) {
      console.error('Error signing in with Google:', error)
      toast.error(error.message || 'Failed to sign in with Google')
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log("Signing in with email:", email)
      
      // Add timeout for the auth request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        clearTimeout(timeoutId);
        
        if (error) {
          console.error("Sign in error:", error)
          throw error
        }
        
        console.log("Sign in successful, data:", data)
        setSession(data.session)
        setUser(data.user)
        
        if (data.user) {
          await fetchProfile(data.user.id)
        }
        
        toast.success('Signed in successfully')
        return { error: null }
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    } catch (error: any) {
      console.error('Error signing in:', error)
      
      // Check for specific error types and provide friendly messages
      let errorMessage = 'Failed to sign in';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage)
      return { error }
    }
  }

  const signUpWithEmail = async (email: string, password: string, fullName: string, userType: UserType) => {
    try {
      console.log("Signing up with email:", email, "userType:", userType)
      
      // Add timeout for the auth request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              user_type: userType
            },
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        
        clearTimeout(timeoutId);
        
        if (error) {
          console.error("Sign up error:", error.message)
          throw error
        }
        
        console.log("Sign up successful, data:", data)
        
        if (data.user) {
          console.log("Auto-signing in after registration")
          // Don't auto-sign in, as we should wait for email verification
          // Instead, just set the session and user
          setSession(data.session)
          setUser(data.user)
        }
        
        toast.success('Account created successfully! Please check your email for verification.')
        return { error: null }
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    } catch (error: any) {
      console.error('Error signing up:', error)
      
      // Friendly error messages for signup
      let errorMessage = 'Failed to sign up';
      
      if (error.message?.includes('email already registered')) {
        errorMessage = 'This email is already registered. Please try signing in instead.';
      } else if (error.message?.includes('password')) {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage)
      return { error }
    }
  }

  return {
    signOut,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail
  }
}
