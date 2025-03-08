
import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useNavigate, useLocation } from 'react-router-dom'
import { Profile, UserType } from '@/types/auth'

type AuthContextType = {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error: any } | undefined>
  signUpWithEmail: (email: string, password: string, fullName: string, userType: UserType) => Promise<{ error: any } | undefined>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
  refreshSession: async () => {},
  signInWithGoogle: async () => {},
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null })
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle() // Changed from single() to maybeSingle() to handle profile not found

      if (error) throw error
      
      if (data) {
        console.log("Profile data fetched:", data)
        setProfile(data as Profile)
      } else {
        console.log("No profile found for user", userId)
        // The profile might be created by the trigger, but it might take time to propagate
        // Let's try to create it manually as a fallback
        const userResult = await supabase.auth.getUser()
        if (userResult.data?.user) {
          const userData = userResult.data.user
          const userMeta = userData.user_metadata
          const userType = userMeta?.user_type || 'patient'
          const fullName = userMeta?.full_name || 'User'
          
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert([{ 
              id: userId, 
              full_name: fullName,
              user_type: userType
            }])
            .select()
          
          if (newProfile) {
            setProfile(newProfile[0] as Profile)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching or creating user profile:', error)
    }
  }

  const refreshSession = async () => {
    try {
      console.log("Refreshing session...")
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      
      console.log("Session data:", data)
      setSession(data.session)
      setUser(data.session?.user ?? null)
      
      if (data.session?.user) {
        await fetchProfile(data.session.user.id)
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
        throw error
      }
      
      console.log("Sign up successful, data:", data)
      
      // For development purposes, we'll automatically sign in the user
      // In production, you would typically ask them to verify their email
      if (data.user) {
        await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        // Create profile manually if the trigger hasn't done it
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle()
            
          if (!profileData && !profileError) {
            await supabase
              .from('profiles')
              .insert([{ 
                id: data.user.id, 
                full_name: fullName,
                user_type: userType
              }])
          }
        } catch (e) {
          console.error("Error checking/creating profile:", e)
        }
      }
      
      toast.success('Account created successfully! Redirecting to dashboard...')
      return { error: null }
    } catch (error: any) {
      console.error('Error signing up:', error)
      return { error }
    }
  }

  useEffect(() => {
    // Get initial session
    refreshSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile,
      isLoading, 
      signOut, 
      refreshSession,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
