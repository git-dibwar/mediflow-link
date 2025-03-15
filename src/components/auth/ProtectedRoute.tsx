
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireUserType?: string[];
}

const ProtectedRoute = ({ 
  children, 
  requireUserType 
}: ProtectedRouteProps) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  // If authentication is still loading, show a loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific user types are required and the profile doesn't match
  if (requireUserType && profile && !requireUserType.includes(profile.user_type)) {
    // Redirect based on user type
    const redirectPath = profile.user_type === 'patient' ? '/dashboard' : '/organization-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default ProtectedRoute;
