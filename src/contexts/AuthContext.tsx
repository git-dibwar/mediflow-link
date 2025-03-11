
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase-client';
import { Profile, UserType } from '@/types/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthLoading: boolean;
  signUp: (email: string, password: string, fullName: string, userType: UserType) => Promise<{ error: any, success?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: any, success?: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isAuthLoading: false,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch profile data for a user
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error('Exception fetching profile:', error);
      return null;
    }
  };

  // Create a profile for a new user if needed
  const createProfile = async (userId: string, userData: Partial<Profile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ id: userId, ...userData }])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error('Exception creating profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      const profileData = await fetchProfile(user.id);
      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (session?.user) {
          setUser(session.user);
          
          // Fetch user profile
          const profileData = await fetchProfile(session.user.id);
          if (profileData) {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            setUser(session.user);
            
            // Fetch or create profile
            const profileData = await fetchProfile(session.user.id);
            if (profileData) {
              setProfile(profileData);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle URL fragments for OAuth callbacks
  useEffect(() => {
    const handleAuthRedirect = async () => {
      if (window.location.hash && window.location.hash.includes('access_token')) {
        try {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error processing auth redirect:', error);
            toast.error('Authentication failed. Please try again.');
            return;
          }
          
          if (data?.session) {
            toast.success('Successfully signed in!');
            // Clean up the URL
            window.history.replaceState(null, document.title, window.location.pathname);
          }
        } catch (error) {
          console.error('Exception processing auth redirect:', error);
          toast.error('Authentication failed.');
        }
      }
    };

    handleAuthRedirect();
  }, []);

  // Sign up with email/password
  const signUp = async (email: string, password: string, fullName: string, userType: UserType) => {
    try {
      setIsAuthLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: userType
          }
        }
      });
      
      if (error) throw error;
      
      toast.success('Account created! Please check your email for verification.');
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Sign up error:', error);
      let errorMessage = 'Failed to sign up.';
      
      if (error.message?.includes('email already registered')) {
        errorMessage = 'This email is already registered. Please try signing in.';
      }
      
      toast.error(errorMessage);
      return { error, success: false };
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    try {
      setIsAuthLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast.success('Signed in successfully!');
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Sign in error:', error);
      let errorMessage = 'Failed to sign in.';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password.';
      }
      
      toast.error(errorMessage);
      return { error, success: false };
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setIsAuthLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error('Failed to sign in with Google.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      toast.success('Signed out successfully.');
      navigate('/login');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthLoading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
