
import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Profile, UserType } from '@/types/auth'
import { useAuthMethods } from './useAuthMethods'
import { useProfileFetcher } from './useProfileFetcher'

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
  const [authInitialized, setAuthInitialized] = useState(false)
  const [retryAttempt, setRetryAttempt] = useState(0)

  // Custom hooks for auth functionality
  const { fetchProfile, isLoading: profileLoading } = useProfileFetcher({ 
    setProfile, 
    fetchErrors, 
    setFetchErrors, 
    user 
  })
  
  const { 
    signOut, 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail 
  } = useAuthMethods({ 
    setUser, 
    setSession, 
    setProfile, 
    fetchProfile 
  })

  const refreshSession = async () => {
    try {
      console.log("Refreshing session...")
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.getSession()
      
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
      
      if (retryAttempt > 0) {
        console.log("Session refreshed successfully after retry:", retryAttempt)
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
      setProfile(null)
      setFetchErrors(prev => prev + 1)
      
      // Retry session refresh if it fails (max 2 retries)
      if (retryAttempt < 2) {
        console.log(`Retrying session refresh (attempt ${retryAttempt + 1})...`)
        setRetryAttempt(prev => prev + 1)
        setTimeout(refreshSession, 1000) // Retry after 1 second
      }
    } finally {
      setIsLoading(false)
      setAuthInitialized(true)
    }
  }

  useEffect(() => {
    // Initial session check
    refreshSession()

    // Subscribe to auth changes
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
        setAuthInitialized(true)
      }
    )

    // Force auth initialization after 2.5 seconds maximum
    const initTimeout = setTimeout(() => {
      if (!authInitialized) {
        console.log("Force completing auth initialization")
        setIsLoading(false)
        setAuthInitialized(true)
      }
    }, 2500)

    return () => {
      subscription.unsubscribe()
      clearTimeout(initTimeout)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile,
      isLoading: isLoading || profileLoading, 
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
