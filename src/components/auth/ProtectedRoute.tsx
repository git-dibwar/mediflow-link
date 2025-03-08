
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, profile, isLoading, refreshSession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Ensure we have the latest session data
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // Fix for back button navigation - register a popstate listener
  useEffect(() => {
    const handlePopState = () => {
      // This helps React Router handle browser back/forward navigation correctly
      console.log('Back/forward navigation detected at:', location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location]);

  // If authentication is still loading, show loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-medical-primary" />
          <p className="text-muted-foreground">Loading your information...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login page
  if (!user) {
    console.log("User not authenticated, redirecting to login");
    // Pass the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("User authenticated:", user.id, "Profile:", profile);

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
