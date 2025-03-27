import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeCodeForTokens } from '../utils/googleCalendar';
import { useToast } from '../contexts/ToastContext';

const AuthCallback = () => {
  const [status, setStatus] = useState('processing');
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          setStatus('error');
          addToast('Google authentication failed: ' + error, 'error');
          setTimeout(() => navigate('/settings'), 2000);
          return;
        }

        if (!code) {
          setStatus('error');
          addToast('No authorization code received from Google', 'error');
          setTimeout(() => navigate('/settings'), 2000);
          return;
        }

        // Exchange the code for tokens
        await exchangeCodeForTokens(code);
        setStatus('success');
        addToast('Successfully connected to Google Calendar!', 'success');
        
        // Redirect back to settings page after a short delay
        setTimeout(() => navigate('/settings'), 1500);
      } catch (error) {
        console.error('Error handling Google auth callback:', error);
        setStatus('error');
        addToast('Failed to connect to Google Calendar', 'error');
        setTimeout(() => navigate('/settings'), 2000);
      }
    };

    handleCallback();
  }, [navigate, addToast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800/80 p-8 rounded-2xl shadow-xl max-w-md w-full border border-orange-800/30">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h2 className="text-xl font-medium text-orange-400 mb-2">Connecting to Google Calendar</h2>
              <p className="text-gray-300">Please wait while we complete the authentication process...</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                ✓
              </div>
              <h2 className="text-xl font-medium text-green-400 mb-2">Successfully Connected!</h2>
              <p className="text-gray-300">You can now sync tasks with Google Calendar</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                ✕
              </div>
              <h2 className="text-xl font-medium text-red-400 mb-2">Connection Failed</h2>
              <p className="text-gray-300">Something went wrong. Redirecting back to settings...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;