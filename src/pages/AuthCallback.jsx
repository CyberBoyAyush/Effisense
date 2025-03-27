import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeCodeForTokens, checkSignedInStatus } from '../utils/googleCalendar';

// Key for storing Google auth status in localStorage - must match with Settings.jsx
const GOOGLE_AUTH_SUCCESS_KEY = 'googleAuthStatus';

const AuthCallback = () => {
  const [status, setStatus] = useState('processing');
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (error) {
          setStatus('error');
          // Store detailed error info in localStorage for Settings to display
          localStorage.setItem(GOOGLE_AUTH_SUCCESS_KEY, JSON.stringify({
            success: false,
            error: error,
            timestamp: Date.now()
          }));
          setTimeout(() => navigate('/settings'), 2000);
          return;
        }
        
        if (!code) {
          setStatus('error');
          localStorage.setItem(GOOGLE_AUTH_SUCCESS_KEY, JSON.stringify({
            success: false,
            error: 'No authorization code received',
            timestamp: Date.now()
          }));
          setTimeout(() => navigate('/settings'), 2000);
          return;
        }
        
        // Exchange the code for tokens
        await exchangeCodeForTokens(code);
        
        // Verify the connection worked by checking signed-in status
        const isConnected = await checkSignedInStatus();
        
        if (isConnected) {
          setStatus('success');
          
          // Use localStorage to indicate success with timestamp
          localStorage.setItem(GOOGLE_AUTH_SUCCESS_KEY, JSON.stringify({
            success: true,
            timestamp: Date.now()
          }));
          
          // Redirect back to settings page after a short delay
          setTimeout(() => navigate('/settings'), 1500);
        } else {
          // If we couldn't verify the connection, treat as an error
          throw new Error('Failed to verify Google Calendar connection');
        }
      } catch (error) {
        console.error('Error handling Google auth callback:', error);
        setStatus('error');
        
        localStorage.setItem(GOOGLE_AUTH_SUCCESS_KEY, JSON.stringify({
          success: false,
          error: error?.message || 'Failed to complete authentication',
          timestamp: Date.now()
        }));
        
        setTimeout(() => navigate('/settings'), 2000);
      }
    };
    
    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800/80 p-8 rounded-2xl shadow-xl max-w-md w-full border border-orange-800/30">
        <div className="text-center">
          {/* Processing state */}
          {status === 'processing' && (
            <>
              <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h2 className="text-xl font-medium text-orange-400 mb-2">Connecting to Google Calendar</h2>
              <p className="text-gray-300">Please wait while we complete the authentication process...</p>
            </>
          )}
          
          {/* Success state */}
          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                ✓
              </div>
              <h2 className="text-xl font-medium text-green-400 mb-2">Successfully Connected!</h2>
              <p className="text-gray-300">You can now sync tasks with Google Calendar</p>
            </>
          )}
          
          {/* Error state */}
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