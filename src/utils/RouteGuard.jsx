import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { account, updateOAuthSession } from './appwrite';

export const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for OAuth in progress in either localStorage or sessionStorage
        if (localStorage.getItem('oauth_in_progress') === 'true' || 
            sessionStorage.getItem('oauth_in_progress') === 'true') {
          console.log('OAuth in progress, skipping auth check');
          setLoading(false);
          setIsAuthenticated(false);
          return;
        }

        // Retrieve stored user to show UI faster while we verify
        const storedUser = localStorage.getItem('loggedInUser');
        let userObj = null;
        
        if (storedUser) {
          try {
            userObj = JSON.parse(storedUser);
          } catch (e) {
            console.warn('Invalid stored user data');
            localStorage.removeItem('loggedInUser');
          }
        }

        try {
          // Try to get the current session
          const session = await account.getSession('current');
          
          if (!session) {
            throw new Error('No active session');
          }
          
          // Skip trying to refresh Google OAuth sessions to avoid errors
          // Google OAuth sessions from Appwrite don't support refresh tokens
          
          // Always get fresh user data to ensure we have up-to-date information
          const freshUser = await account.get();
          
          if (freshUser) {
            // Update localStorage with fresh user data
            localStorage.setItem('loggedInUser', JSON.stringify(freshUser));
            setIsAuthenticated(true);
          } else {
            throw new Error('User data not available');
          }
        } catch (error) {
          console.error('Authentication verification failed:', error);
          localStorage.removeItem('loggedInUser');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Critical auth error:', error);
        localStorage.removeItem('loggedInUser');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export const PublicRoute = ({ children }) => {
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      // Don't redirect if OAuth is in progress (check both storage types)
      if (localStorage.getItem('oauth_in_progress') === 'true' || 
          sessionStorage.getItem('oauth_in_progress') === 'true') {
        setLoading(false);
        return;
      }
      
      try {
        // Check if we have an active session
        try {
          const session = await account.getSession('current');
          
          if (session) {
            // Session exists, verify user account also exists
            try {
              const user = await account.get();
              if (user) {
                // User exists and is authenticated, redirect to dashboard
                setShouldRedirect(true);
              }
            } catch (userError) {
              // Session exists but no user - unusual state
              console.warn('Session exists but user retrieval failed:', userError);
              setShouldRedirect(false);
            }
          } else {
            // No session, definitely not authenticated
            setShouldRedirect(false);
          }
        } catch (sessionError) {
          // Error getting session - not authenticated
          setShouldRedirect(false);
        }
      } catch (error) {
        // Fallback error handling
        console.error('Error checking authentication status:', error);
        setShouldRedirect(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return shouldRedirect ? <Navigate to="/dashboard" replace /> : children;
};
