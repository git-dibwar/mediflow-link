
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
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
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
    } catch (error: any) {
      console.error('Error signing in:', error)
      toast.error(error.message || 'Failed to sign in')
      return { error }
    }
  }

  const signUpWithEmail = async (email: string, password: string, fullName: string, userType: UserType) => {
    try {
      console.log("Signing up with email:", email, "userType:", userType)
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
      })
      
      if (error) {
        console.error("Sign up error:", error.message)
        throw error
      }
      
      console.log("Sign up successful, data:", data)
      
      if (data.user) {
        console.log("Auto-signing in after registration")
        await signInWithEmail(email, password)
      }
      
      toast.success('Account created successfully!')
      return { error: null }
    } catch (error: any) {
      console.error('Error signing up:', error)
      toast.error(error.message || 'Failed to sign up')
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
