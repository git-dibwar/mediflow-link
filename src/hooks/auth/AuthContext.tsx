import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Profile, UserType } from '@/types/auth'
import { useAuthMethods } from './useAuthMethods'
import { useProfileFetcher } from './useProfileFetcher'
import { useNavigate } from 'react-router-dom'

type AuthContextType = {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error: any, success?: boolean } | undefined>
  signUpWithEmail: (email: string, password: string, fullName: string, userType: UserType) => Promise<{ error: any, success?: boolean } | undefined>
  isAuthLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAuthLoading: false,
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
  const [redirectReady, setRedirectReady] = useState(false)

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
    signUpWithEmail,
    isAuthLoading 
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
      
      const hasAuthFragment = window.location.hash && 
                           (window.location.hash.includes('access_token') || 
                            window.location.hash.includes('error_description'))
      
      if (hasAuthFragment) {
        console.log("Auth hash fragment detected in URL, processing...")
      }
      
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error("Session error:", error)
        throw error
      }
      
      console.log("Session data:", data)
      
      if (data.session) {
        setSession(data.session)
        setUser(data.session?.user ?? null)
        
        console.log("User found in session, fetching profile", data.session.user.id)
        await fetchProfile(data.session.user.id)
        
        if (hasAuthFragment && !redirectReady) {
          setRedirectReady(true)
        }
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
      
      if (retryAttempt < 2) {
        console.log(`Retrying session refresh (attempt ${retryAttempt + 1})...`)
        setRetryAttempt(prev => prev + 1)
        setTimeout(refreshSession, 1000)
      }
    } finally {
      setIsLoading(false)
      setAuthInitialized(true)
    }
  }

  useEffect(() => {
    const handleHashFragment = async () => {
      if (window.location.hash && window.location.hash.includes('access_token')) {
        console.log("Access token found in URL, processing...")
        
        try {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Error processing URL auth:", error);
            toast.error("Failed to complete authentication");
            return;
          }
          
          if (data?.session) {
            console.log("Session extracted from URL:", data.session.user.id);
            setSession(data.session);
            setUser(data.session.user);
            await fetchProfile(data.session.user.id);
            
            window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
            toast.success("Successfully signed in!");
          }
        } catch (error) {
          console.error("Error processing auth URL:", error);
          toast.error("Authentication failed. Please try again.");
        }
      }
    };
    
    handleHashFragment();
  }, []);

  useEffect(() => {
    if (redirectReady && user && profile) {
      console.log("Ready to redirect after auth, user type:", profile.user_type)
      
      if (window.location.hash) {
        window.history.replaceState(null, document.title, window.location.pathname + window.location.search)
      }
      
      setRedirectReady(false)
    }
  }, [redirectReady, user, profile])

  useEffect(() => {
    const clearStaleData = async () => {
      const hasAuthParams = window.location.hash && 
        (window.location.hash.includes('access_token') || 
         window.location.hash.includes('error_description'));
      
      if (!hasAuthParams) {
        try {
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            console.log("No valid session, clearing any stale auth data");
            localStorage.removeItem('supabase.auth.token');
            localStorage.removeItem('mediflow-auth');
          }
        } catch (e) {
          console.error("Error checking session:", e);
        }
      }
    };
    
    clearStaleData();
    
    refreshSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setIsLoading(true);
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchProfile(session.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
        
        setIsLoading(false);
        setAuthInitialized(true);
      }
    );

    const initTimeout = setTimeout(() => {
      if (!authInitialized) {
        console.log("Force completing auth initialization");
        setIsLoading(false);
        setAuthInitialized(true);
      }
    }, 2500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(initTimeout);
    };
  }, []);

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
      signUpWithEmail,
      isAuthLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
