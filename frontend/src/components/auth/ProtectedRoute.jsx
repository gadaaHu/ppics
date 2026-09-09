import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.some(role => {
      // Check if user is a member (for member routes)
      if (role === 'member' && user?.is_member) {
        return true;
      }
      // Check regular role
      return user?.role === role;
    });

    if (!hasRequiredRole) {
      // Redirect to appropriate dashboard based on role
      if (user?.is_member || user?.role === 'member') {
        return <Navigate to="/member/dashboard" replace />;
      } else if (user?.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (user?.role === 'leader') {
        return <Navigate to="/leader/dashboard" replace />;
      } else if (user?.role === 'family_leader') {
        return <Navigate to="/family-leader/dashboard" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;