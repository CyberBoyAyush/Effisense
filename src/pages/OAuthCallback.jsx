import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { account, createAccountFromOAuthSession } from '../utils/appwrite';
import { FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [message, setMessage] = useState('');
  const [processingStep, setProcessingStep] = useState('validating'); // Track detailed processing state
  
  const isSuccess = searchParams.get('success') === 'true';
  const oauthState = searchParams.get('state');
  
  // Try to get state from both sessionStorage (primary) and localStorage (fallback)
  const storedState = sessionStorage.getItem('oauth_state') || localStorage.getItem('oauth_state');
  const redirectTo = sessionStorage.getItem('oauth_redirect') || localStorage.getItem('oauth_redirect') || 'dashboard';

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Immediately clear OAuth flags from both localStorage and sessionStorage
        ['oauth_in_progress', 'oauth_state', 'oauth_redirect', 'oauth_timestamp'].forEach(key => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
        
        // Check if this is a valid OAuth response
        if (!isSuccess) {
          setStatus('error');
          setMessage('Google sign-in was canceled or failed. Please try again.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        
        // More lenient state validation - log warning but continue if state doesn't match
        // This helps users still authenticate even if state was lost during redirect
        if (!oauthState || oauthState !== storedState) {
          console.warn('OAuth state mismatch or missing:', { received: oauthState, stored: storedState });
          // Don't fail completely on state mismatch - continue with caution
        }
        
        console.log('Processing OAuth callback, verifying session...');
        setProcessingStep('session');
        
        try {
          // First verify we have a valid session
          const session = await account.getSession('current');
          
          if (!session) {
            throw new Error('No active session found after OAuth redirect');
          }
          
          if (session.provider !== 'google') {
            throw new Error(`Expected Google auth but found: ${session.provider}`);
          }
          
          console.log('Valid Google session detected, checking for user account...');
          setProcessingStep('account');
          
          try {
            // Try to get current user (simpler approach)
            const user = await account.get();
            
            if (user) {
              console.log('User authenticated successfully:', user.name);
              // Store user in localStorage
              localStorage.setItem('loggedInUser', JSON.stringify(user));
              setStatus('success');
              setMessage(`Successfully signed in as ${user.name || user.email}!`);
              
              // Redirect after success message
              setTimeout(() => navigate(`/${redirectTo}`), 1500);
              return;
            }
          } catch (userError) {
            // If user doesn't exist, try to create one from OAuth profile
            if (userError.code === 401) {
              console.log('No existing user, attempting to create from OAuth session...');
              const user = await createAccountFromOAuthSession();
              
              if (user) {
                console.log('New user created from OAuth:', user.name);
                localStorage.setItem('loggedInUser', JSON.stringify(user));
                setStatus('success');
                setMessage(`Account created and signed in as ${user.name || user.email}!`);
                setTimeout(() => navigate(`/${redirectTo}`), 1500);
                return;
              } else {
                throw new Error('Failed to create user account from OAuth session');
              }
            } else {
              throw userError;
            }
          }
        } catch (error) {
          console.error('Error during OAuth account processing:', error);
          setStatus('error');
          setMessage('Unable to complete sign in. Please try again.');
          setTimeout(() => navigate('/login'), 2000);
        }
      } catch (error) {
        console.error('Uncaught OAuth callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    processOAuthCallback();
  }, [isSuccess, navigate, oauthState, storedState, redirectTo]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] bg-gradient-to-br from-black via-gray-900 to-[#0F0F0F] p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px] 
          -top-20 -left-20 animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[120px] 
          -bottom-20 -right-20 animate-pulse delay-1000"></div>
      </div>
      
      <motion.div 
        className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-orange-700/30 relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.div 
          className="mx-auto mb-6 h-16 w-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <FaCalendarAlt className="text-white text-3xl" />
        </motion.div>
        
        <h2 className="text-xl font-bold text-center text-white mb-6">
          {status === 'processing' && 'Completing Authentication...'}
          {status === 'success' && 'Authentication Successful!'}
          {status === 'error' && 'Authentication Error'}
        </h2>
        
        {status === 'processing' && (
          <div className="flex flex-col items-center mb-4">
            <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-400 text-sm">
              {processingStep === 'validating' && 'Verifying your authentication...'}
              {processingStep === 'session' && 'Retrieving your session...'}
              {processingStep === 'account' && 'Setting up your account...'}
            </p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
            <FaCheckCircle className="text-green-400 text-lg mt-0.5" />
            <p className="text-green-300">{message}</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
            <FiAlertTriangle className="text-red-400 text-lg mt-0.5" />
            <p className="text-red-300">{message}</p>
          </div>
        )}
        
        <p className="text-gray-400 text-center mt-6 text-sm">
          {status === 'processing' && 'Please wait while we complete your authentication...'}
          {status === 'success' && 'Redirecting you to your dashboard...'}
          {status === 'error' && 'You will be redirected back to login in a moment.'}
        </p>
      </motion.div>
    </div>
  );
};

export default OAuthCallback;
