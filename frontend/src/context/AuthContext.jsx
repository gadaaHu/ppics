import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authApi from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await authApi.getProfile();
          if (response.success) {
            const userData = response.data;
            // Ensure is_member is properly set
            setUser({
              ...userData,
              is_member: userData.is_member || userData.role === 'member',
              photo: userData.photo || null,
              photo_url: userData.photo_url || null
            });
          } else {
            logout();
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []); // ✅ Empty dependency array - only run once

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authApi.login(credentials);
      
      if (response.success) {
        const { token, user, stats } = response;
        
        // Store token
        localStorage.setItem('token', token);
        setToken(token);
        
        // Ensure is_member is properly set
        const userData = {
          ...user,
          is_member: user.is_member || user.role === 'member',
          photo: user.photo || null,
          photo_url: user.photo_url || null,
          stats: stats
        };
        
        setUser(userData);
        
        // Store role and member status for quick access
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('isMember', userData.is_member ? 'true' : 'false');
        
        return { success: true, user: userData };
      } else {
        setError(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('isMember');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  // ✅ Make sure all values are defined
  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token && !!user,
    isMember: user?.is_member || user?.role === 'member' || false,
    isAdmin: user?.role === 'admin' || false,
    isLeader: user?.role === 'leader' || user?.role === 'admin' || false,
    userRole: user?.role || null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Export useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;