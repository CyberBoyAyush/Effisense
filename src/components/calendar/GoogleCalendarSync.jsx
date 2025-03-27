import React, { useState, useEffect } from 'react';
import { handleGoogleAuth, checkSignedInStatus, signOutFromGoogle } from '../../utils/googleCalendar';
import { FaGoogle, FaCheckCircle, FaExclamationTriangle, FaCalendarAlt } from 'react-icons/fa';
import { useToast } from '../../contexts/ToastContext';

const GoogleCalendarSync = ({ onSyncStatusChange }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start as loading until we check
  const { addToast } = useToast();
  
  // Check if the user is already authenticated with Google
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const isSignedIn = await checkSignedInStatus();
        setIsConnected(isSignedIn);
        if (onSyncStatusChange) {
          onSyncStatusChange(isSignedIn);
        }
      } catch (error) {
        console.error('Error checking Google auth status:', error);
        setIsConnected(false);
        if (onSyncStatusChange) {
          onSyncStatusChange(false);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, [onSyncStatusChange]);
  
  const handleConnect = () => {
    setIsLoading(true);
    try {
      // This will redirect to Google OAuth without showing toasts
      // The AuthCallback page will handle showing the success/error toasts
      handleGoogleAuth();
      // No need to set states here as page will redirect
    } catch (error) {
      console.error('Error initiating Google Calendar connection:', error);
      addToast('Error connecting to Google Calendar. Please try again.', 'error');
      setIsConnected(false);
      setIsLoading(false);
    }
  };
  
  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await signOutFromGoogle();
      setIsConnected(false);
      if (onSyncStatusChange) {
        onSyncStatusChange(false);
      }
      // Single toast for disconnect success
      addToast('Disconnected from Google Calendar.', 'info');
    } catch (error) {
      console.error('Error disconnecting from Google Calendar:', error);
      addToast('Error disconnecting from Google Calendar.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="text-blue-400 p-2 rounded-lg bg-blue-400/10">
          <FaCalendarAlt size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-200">Google Calendar</h3>
          <p className="text-xs text-gray-400">
            {isConnected
              ? 'Your tasks sync with Google Calendar'
              : 'Connect to sync tasks with Google Calendar'}
          </p>
        </div>
        <div>
          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="text-green-400 flex items-center text-xs gap-1">
                <FaCheckCircle /> Connected
              </span>
              <button
                onClick={handleDisconnect}
                disabled={isLoading}
                className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
              >
                {isLoading ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm"
            >
              <FaGoogle />
              {isLoading ? 'Connecting...' : 'Connect'}
            </button>
          )}
        </div>
      </div>
      
      {isConnected && (
        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 flex items-start gap-2">
          <FaCheckCircle className="text-blue-400 mt-0.5" />
          <p className="text-xs text-blue-300">
            Your tasks will be automatically synced to your Google Calendar when created or updated with the "Google Sync" option enabled.
          </p>
        </div>
      )}
    </div>
  );
};

export default GoogleCalendarSync;