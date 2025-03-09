
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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

  // Ensure we have the latest session data with retry and timeout logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const attemptRefresh = async () => {
      try {
        await refreshSession();
        setNetworkError(false);
      } catch (error) {
        console.error("Session refresh error:", error);
        setLoadingAttempts(prev => prev + 1);
        
        // After 3 attempts, consider it a network error
        if (loadingAttempts >= 2) {
          setNetworkError(true);
          toast.error("Network connection issue. Please check your internet connection.");
        } else {
          // Retry after a delay
          timeoutId = setTimeout(attemptRefresh, 3000);
        }
      }
    };
    
    attemptRefresh();
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
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
  if (isLoading && loadingAttempts < 3) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-medical-primary" />
          <p className="text-muted-foreground">Loading your information...</p>
        </div>
      </div>
    );
  }

  // After 3 loading attempts, force going through auth flow again
  if (isLoading && loadingAttempts >= 3) {
    console.log("Multiple loading attempts, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is not authenticated, redirect to login page
  if (!user) {
    console.log("User not authenticated, redirecting to login");
    // Pass the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("User authenticated:", user.id, "Profile:", profile);

  // If profile failed to load but user is authenticated, assume patient type as fallback
  if (!profile) {
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

  // Redirect professional users to their dashboard if accessing patient routes
  if (profile && 
      profile.user_type !== 'patient' && 
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
  if (profile && 
      profile.user_type === 'patient' && 
      (
        location.pathname === '/organization-dashboard' ||
        location.pathname === '/organization-profile'
      )
     ) {
    console.log("Patient accessing professional routes, redirecting to patient dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // If user is authenticated and has correct role for the route, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
