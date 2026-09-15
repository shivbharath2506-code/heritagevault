import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="page-loader-container">
        <div className="spinner" />
        <p>Verifying museum staff authorization...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="access-denied-container">
        <ShieldAlert size={48} className="text-amber-500" />
        <h2>Authentication Required</h2>
        <p>Please log in with authorized museum staff credentials to access this section.</p>
      </div>
    );
  }

  if (allowedRoles && !hasRole(...allowedRoles)) {
    return (
      <div className="access-denied-container card">
        <ShieldAlert size={48} className="text-rose-500" />
        <h2>403 - Access Restricted</h2>
        <p>
          Your current role (<strong>{user.role.toUpperCase()}</strong>) does not have permission to view or manage this module.
        </p>
        <span className="access-denied-subtext">Contact your Chief Museum Administrator to request elevated curatorial or conservation permissions.</span>
      </div>
    );
  }

  return <>{children}</>;
};
