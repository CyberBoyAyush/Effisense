import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser, isUserVerified, sendVerificationEmail } from './appwrite';
import { motion } from 'framer-motion';
import { FaEnvelope } from 'react-icons/fa';
import { useToast } from '../contexts/ToastContext';

export const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const location = useLocation();
  const { addToast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        // Only check verification if explicitly required for new accounts
        if (sessionStorage.getItem('requiresVerification') === 'true') {
          const verificationStatus = await isUserVerified();
          if (verificationStatus) {
            sessionStorage.removeItem('requiresVerification');
            sessionStorage.removeItem('accountCreatedAt');
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
    setLoading(false);
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await sendVerificationEmail();
      addToast('Verification email sent! Please check your inbox.', 'success');
    } catch (error) {
      addToast('Failed to send verification email. Please try again.', 'error');
    }
    setResending(false);
  };

  if (loading) {
    return children; // Return children while loading to prevent flash
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only show verification modal for new accounts that require verification
  if (sessionStorage.getItem('requiresVerification') === 'true') {
    return (
      <>
        {/* Show the protected content dimmed in background */}
        <div className="pointer-events-none opacity-20">
          {children}
        </div>
        
        {/* Verification Modal */}
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-4"
          >
            <div className="bg-gray-800/90 backdrop-blur-md p-8 rounded-2xl border border-orange-700/30 shadow-xl">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 mb-6 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <FaEnvelope className="w-8 h-8 text-orange-500" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-4">Email Verification Required</h2>
                <p className="text-gray-300 mb-6">
                  Please verify your email address to access this page. Check your inbox for the verification link.
                </p>
                
                <button
                  onClick={handleResendVerification}
                  disabled={resending}
                  className={`w-full px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 ${
                    resending
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {resending ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return children;
};
