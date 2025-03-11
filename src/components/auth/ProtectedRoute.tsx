
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
  }, [location.hash, refreshSession]);

  // Ensure we have the latest session data with retry and timeout logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const attemptRefresh = async () => {
      try {
        await refreshSession();
        setNetworkError(false);
        setAuthCheckComplete(true);
      } catch (error) {
        console.error("Session refresh error:", error);
        setLoadingAttempts(prev => prev + 1);
        
        // After 2 attempts, consider it a network error
        if (loadingAttempts >= 1) {
          setNetworkError(true);
          setAuthCheckComplete(true);
          toast.error("Network connection issue. Please check your internet connection.");
        } else {
          // Retry after a delay
          timeoutId = setTimeout(attemptRefresh, 1500);
        }
      }
    };
    
    // Set a timeout to enforce completion of auth check
    const forceCompleteTimeout = setTimeout(() => {
      if (!authCheckComplete) {
        console.log("Force completing auth check after timeout");
        setAuthCheckComplete(true);
        setForceComplete(true);
      }
    }, 3000);
    
    // Hide loading spinner after 5 seconds regardless of auth status
    const hideLoadingTimeout = setTimeout(() => {
      setShowLoading(false);
    }, 5000);
    
    attemptRefresh();
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      clearTimeout(forceCompleteTimeout);
      clearTimeout(hideLoadingTimeout);
    };
  }, [refreshSession, loadingAttempts]);

  // Fix for back button navigation - register a popstate listener
  useEffect(() => {
    const handlePopState = () => {
      // This helps React Router handle browser back/forward navigation correctly
      console.log('Back/forward navigation detected at:', location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location]);

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
              }}
              variant="default"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => {
                signOut().then(() => navigate('/login'));
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

  // If authentication is still loading, show loading indicator
  // But limit this to a few seconds max with the forceComplete flag
  if ((isLoading || showLoading) && !authCheckComplete && !forceComplete && loadingAttempts < 2) {
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
    // Let the auth provider handle the hash, but clean up the URL
    window.history.replaceState(null, document.title, window.location.pathname);
    return <Navigate to="/dashboard" replace />;
  }

  // Force redirect to login if we've completed auth check and there's no user
  if ((authCheckComplete || forceComplete) && !user) {
    console.log("Auth check complete, no user found, redirecting to login");
    // Pass the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we're on the login page and have a user, redirect to appropriate dashboard
  if (location.pathname === '/login' && user) {
    const destination = profile?.user_type === 'patient' ? '/dashboard' : '/organization-dashboard';
    console.log(`User already logged in, redirecting to ${destination}`);
    return <Navigate to={destination} replace />;
  }

  // If we've gotten this far and we're not on the login page, but don't have a user,
  // redirect to login (happens when forceComplete is true but there's no user)
  if (!user && location.pathname !== '/login') {
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If profile failed to load but user is authenticated, assume patient type as fallback
  if (user && !profile) {
    console.log("Profile missing, using default access");
    // Redirect professional routes to patient dashboard for safety
    if (
      location.pathname === '/organization-dashboard' ||
      location.pathname === '/organization-profile'
    ) {
      return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
  }

  // Route-based authorization checks
  if (user && profile) {
    // Redirect professional users to their dashboard if accessing patient routes
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

    // Redirect patients to their dashboard if accessing professional routes
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

  // Special case for root path with authenticated user
  if (user && location.pathname === '/') {
    const destination = profile?.user_type === 'patient' ? '/dashboard' : '/organization-dashboard';
    console.log(`User at root path, redirecting to ${destination}`);
    return <Navigate to={destination} replace />;
  }

  // If user is authenticated and has correct role for the route, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
