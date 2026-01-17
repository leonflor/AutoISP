import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import type { AppRole } from '@/types/database';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: AppRole[];
  fallbackPath?: string;
}

export const RoleGuard = ({ 
  children, 
  allowedRoles, 
  fallbackPath = '/auth' 
}: RoleGuardProps) => {
  const { user, roles, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const hasAllowedRole = allowedRoles.some(role => roles.includes(role));

  if (!hasAllowedRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
