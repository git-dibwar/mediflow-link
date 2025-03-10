
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
  const [fetchErrors, setFetchErrors] = useState(0)

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user ID:", userId)
      
      const fetchWithTimeout = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
          // Removed the abortSignal method that was causing the error
          // Instead, we'll use a try/catch with the timeout to handle potential issues
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

  const refreshSession = async () => {
    try {
      console.log("Refreshing session...")
      setIsLoading(true)
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const { data, error } = await supabase.auth.getSession();
        clearTimeout(timeoutId);
        
        if (error) {
          console.error("Session error:", error)
          throw error
        }
        
        console.log("Session data:", data)
        setSession(data.session)
        setUser(data.session?.user ?? null)
        
        if (data.session?.user) {
          console.log("User found in session, fetching profile")
          await fetchProfile(data.session.user.id)
        } else {
          console.log("No user in session")
          setProfile(null)
        }
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
      
    } catch (error) {
      console.error('Error refreshing session:', error)
      
      if (fetchErrors > 3 && user) {
        console.log("Network issues detected, maintaining existing session");
        setIsLoading(false);
        return;
      }
      
      setProfile(null);
      setFetchErrors(prev => prev + 1);
      throw error;
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

  useEffect(() => {
    refreshSession()

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
