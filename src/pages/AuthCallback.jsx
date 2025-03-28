import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeCodeForTokens, checkSignedInStatus, storeAuthStatus } from '../utils/googleCalendar';

const AuthCallback = () => {
  const [status, setStatus] = useState('processing');
  const [errorDetails, setErrorDetails] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        console.log('AuthCallback: Processing OAuth callback');
        
        if (error) {
          console.error('OAuth error:', error);
          setStatus('error');
          setErrorDetails(error);
          
          // Store detailed error info in Appwrite
          await storeAuthStatus({
            success: false,
            error: error,
            timestamp: Date.now()
          });
          
          setTimeout(() => navigate('/settings'), 3000);
          return;
        }
        
        if (!code) {
          console.error('No authorization code received');
          setStatus('error');
          setErrorDetails('No authorization code received');
          
          await storeAuthStatus({
            success: false,
            error: 'No authorization code received',
            timestamp: Date.now()
          });
          
          setTimeout(() => navigate('/settings'), 3000);
          return;
        }
        
        console.log('AuthCallback: Exchanging code for tokens');
        
        // Exchange the code for tokens
        await exchangeCodeForTokens(code);
        
        console.log('AuthCallback: Token exchange complete, verifying connection');
        
        // Verify the connection worked by checking signed-in status
        const isConnected = await checkSignedInStatus();
        console.log('AuthCallback: Connection status:', isConnected);
        
        if (isConnected) {
          setStatus('success');
          
          // Store success status in Appwrite
          console.log('AuthCallback: Storing success status in Appwrite');
          await storeAuthStatus({
            success: true,
            timestamp: Date.now()
          });
          
          // Redirect back to settings page after a short delay
          setTimeout(() => navigate('/settings'), 2000);
        } else {
          // If we couldn't verify the connection, treat as an error
          throw new Error('Failed to verify Google Calendar connection');
        }
      } catch (error) {
        console.error('Error handling Google auth callback:', error);
        setStatus('error');
        setErrorDetails(error?.message || 'Failed to complete authentication');
        
        await storeAuthStatus({
          success: false,
          error: error?.message || 'Failed to complete authentication',
          timestamp: Date.now()
        });
        
        setTimeout(() => navigate('/settings'), 3000);
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
              {errorDetails && (
                <p className="mt-3 text-xs text-red-300/70 bg-red-500/10 p-2 rounded">
                  Error: {errorDetails}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;