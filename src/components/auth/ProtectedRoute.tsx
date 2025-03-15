
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, profile, isLoading, refreshSession, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loadingAttempts, setLoadingAttempts] = useState(0);
  const [networkError, setNetworkError] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [forceComplete, setForceComplete] = useState(false);
  const [showLoading, setShowLoading] = useState(true);

  // Handle URL hash for OAuth redirects
  useEffect(() => {
    const hasAuthFragment = window.location.hash && 
                         (window.location.hash.includes('access_token') || 
                          window.location.hash.includes('error_description'));
                          
    if (hasAuthFragment) {
      console.log("Auth fragment detected in ProtectedRoute, refreshing session");
      refreshSession();
    }
  }, [location.hash]);

  // Handle authentication state and force completion after timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const attemptRefresh = async () => {
      try {
        // Clear any hash parameters to prevent issues
        if (window.location.hash) {
          // Store the current hash in case it contains auth tokens
          const currentHash = window.location.hash;
          
          // Only replace if it doesn't contain auth tokens
          if (!currentHash.includes('access_token')) {
            window.history.replaceState(
              null, 
              document.title, 
              window.location.pathname + window.location.search
            );
          }
        }
        
        await refreshSession();
        setNetworkError(false);
        setAuthCheckComplete(true);
      } catch (error) {
        console.error("Session refresh error:", error);
        setLoadingAttempts(prev => prev + 1);
        
        if (loadingAttempts >= 2) {
          setNetworkError(true);
          setAuthCheckComplete(true);
          toast.error("Unable to connect. Please check your connection and try again.");
        } else {
          // Retry with exponential backoff
          const delay = Math.min(1000 * (2 ** loadingAttempts), 5000);
          timeoutId = setTimeout(attemptRefresh, delay);
        }
      }
    };
    
    // Set a timeout to enforce completion of auth check
    const forceCompleteTimeout = setTimeout(() => {
      if (!authCheckComplete) {
        console.log("Force completing auth check after timeout");
        setAuthCheckComplete(true);
        setForceComplete(true);
        
        // If after forced completion there's still no user, redirect to login
        if (!user) {
          navigate('/login', { replace: true, state: { from: location } });
        }
      }
    }, 3000);
    
    // Hide loading spinner after 3 seconds regardless of auth status
    const hideLoadingTimeout = setTimeout(() => {
      setShowLoading(false);
    }, 3000);
    
    attemptRefresh();
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      clearTimeout(forceCompleteTimeout);
      clearTimeout(hideLoadingTimeout);
    };
  }, [refreshSession, loadingAttempts]);

  // If there's a network error, show a retry button
  if (networkError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4 p-6 border rounded-lg shadow-sm">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold">Connection Error</h2>
          <p className="text-muted-foreground text-center">
            Unable to connect to the server. Please check your internet connection.
          </p>
          <div className="flex gap-4 mt-2">
            <Button 
              onClick={() => {
                setNetworkError(false);
                setLoadingAttempts(0);
                setAuthCheckComplete(false);
                setForceComplete(false);
                setShowLoading(true);
                
                // Clear any cached auth data that might be causing issues
                localStorage.removeItem('supabase.auth.token');
                localStorage.removeItem('mediflow-auth');
                sessionStorage.clear();
              }}
              variant="default"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => {
                signOut().then(() => navigate('/login', { replace: true }));
              }}
              variant="outline"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If still loading and not forced complete, show loading indicator
  if ((isLoading || showLoading) && !authCheckComplete && !forceComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-medical-primary" />
          <p className="text-muted-foreground">Loading your information...</p>
        </div>
      </div>
    );
  }

  // Handle OAuth redirects from URL hash
  if (window.location.hash && window.location.hash.includes('access_token')) {
    console.log("Auth token found in URL, redirecting to dashboard");
    // Clean up the URL
    window.history.replaceState(null, document.title, window.location.pathname);
    return <Navigate to="/dashboard" replace />;
  }

  // Force redirect to login if we've completed auth check and there's no user
  if ((authCheckComplete || forceComplete) && !user) {
    console.log("Auth check complete, no user found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we're on the login page and have a user, redirect to appropriate dashboard
  if (location.pathname === '/login' && user) {
    const destination = profile?.user_type === 'patient' ? '/dashboard' : '/organization-dashboard';
    console.log(`User already logged in, redirecting to ${destination}`);
    return <Navigate to={destination} replace />;
  }

  // If we're at the root path with authenticated user, redirect to dashboard
  if (user && location.pathname === '/') {
    const destination = profile?.user_type === 'patient' ? '/dashboard' : '/organization-dashboard';
    console.log(`User at root path, redirecting to ${destination}`);
    return <Navigate to={destination} replace />;
  }

  // For safety, assume patient if profile is missing but user is authenticated
  if (user && !profile) {
    console.log("Profile missing, using default access");
    
    if (
      location.pathname === '/organization-dashboard' ||
      location.pathname === '/organization-profile'
    ) {
      return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
  }

  // Role-based redirects
  if (user && profile) {
    // Redirect professional users away from patient routes
    if (profile.user_type !== 'patient' && 
        (
          location.pathname === '/dashboard' ||
          location.pathname === '/reports' ||
          location.pathname === '/consultations' ||
          location.pathname === '/providers' ||
          location.pathname === '/medications' ||
          location.pathname === '/appointments' ||
          location.pathname === '/records'
        )
      ) {
      console.log("Professional user accessing patient routes, redirecting to professional dashboard");
      return <Navigate to="/organization-dashboard" replace />;
    }

    // Redirect patients away from professional routes
    if (profile.user_type === 'patient' && 
        (
          location.pathname === '/organization-dashboard' ||
          location.pathname === '/organization-profile'
        )
      ) {
      console.log("Patient accessing professional routes, redirecting to patient dashboard");
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
