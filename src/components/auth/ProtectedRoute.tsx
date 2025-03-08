
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

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

  // If user is not authenticated, redirect to landing page
  if (!user) {
    // Pass the current location to redirect back after login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If user is authenticated, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
