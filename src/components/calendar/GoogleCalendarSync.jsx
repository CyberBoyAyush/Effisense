import React, { useState, useEffect, useCallback } from 'react';
import { handleGoogleAuth, checkSignedInStatus, signOutFromGoogle } from '../../utils/googleCalendar';
import { FaGoogle, FaCheckCircle, FaExclamationTriangle, FaCalendarAlt, FaSpinner, FaSignOutAlt } from 'react-icons/fa';
import { useToast } from '../../contexts/ToastContext';

// Key for Google auth success in localStorage - must match with Settings.jsx
const GOOGLE_AUTH_SUCCESS_KEY = 'googleAuthStatus';

const GoogleCalendarSync = ({ 
  onSyncStatusChange, 
  initialConnected = false,
  isCheckingConnection = false,
  refreshConnectionStatus = null
}) => {
  const [isConnected, setIsConnected] = useState(initialConnected);
  const [isLoading, setIsLoading] = useState(isCheckingConnection);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  // We'll access the useToast context but won't show toasts from this component
  // All toast messages are centralized in Settings.jsx
  const { addToast } = useToast();
  
  // Force a check of the connection status when component mounts
  const checkConnection = useCallback(async () => {
    try {
      if (isDisconnecting || isLoading) return;
      
      setIsLoading(true);
      setConnectionError(false);
      
      const connStatus = await checkSignedInStatus();
      console.log("GoogleCalendarSync - Connection status check:", connStatus);
      
      // Only update if status changed to prevent unnecessary re-renders
      if (connStatus !== isConnected) {
        setIsConnected(connStatus);
        
        // Notify parent component
        if (onSyncStatusChange) {
          onSyncStatusChange(connStatus);
        }
      }
    } catch (error) {
      console.error("Error checking connection status:", error);
      setConnectionError(true);
      // DO NOT show toast here - it will be handled by the parent
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, onSyncStatusChange, isDisconnecting, isLoading]);

  // Update local state when props change, but avoid unnecessary state updates
  useEffect(() => {
    if (!isLoading && !isDisconnecting && initialConnected !== isConnected) {
      setIsConnected(initialConnected);
    }
  }, [initialConnected, isLoading, isDisconnecting, isConnected]);

  // Handle connection initiation
  const handleConnect = () => {
    setIsLoading(true);
    setConnectionError(false);
    
    try {
      // This triggers a redirect to Google OAuth
      handleGoogleAuth();
      // No toast here - will be handled by AuthCallback -> Settings flow
    } catch (error) {
      console.error('Error initiating Google Calendar connection:', error);
      
      // Store error in localStorage instead of showing toast directly
      localStorage.setItem(GOOGLE_AUTH_SUCCESS_KEY, JSON.stringify({
        success: false,
        error: 'Failed to initiate Google connection',
        timestamp: Date.now()
      }));
      
      setIsConnected(false);
      setIsLoading(false);
      setConnectionError(true);
    }
  };
  
  // Handle disconnection with improved state management
  const handleDisconnect = async () => {
    if (isDisconnecting) return; // Prevent multiple clicks
    
    setIsDisconnecting(true);
    
    try {
      const result = await signOutFromGoogle();
      console.log("Disconnect result:", result);
      
      // Update local state
      setIsConnected(false);
      
      // Notify parent component which will handle the toast
      if (onSyncStatusChange) {
        onSyncStatusChange(false);
      }
      
      // If refresh callback provided, call it after a short delay
      if (refreshConnectionStatus) {
        setTimeout(() => {
          refreshConnectionStatus();
        }, 300);
      }
    } catch (error) {
      console.error('Error disconnecting from Google Calendar:', error);
      
      // Let the parent component handle showing the error toast
      setConnectionError(true);
      
      // Force a connection status refresh
      if (refreshConnectionStatus) {
        refreshConnectionStatus();
      }
    } finally {
      setIsDisconnecting(false);
      setIsLoading(false);
    }
  };

  // Don't show the error box if we're loading or disconnecting
  const showError = connectionError && !isLoading && !isDisconnecting;
  
  // Only show success message when we're connected, not disconnecting or checking, and no errors
  const showSuccess = isConnected && !isDisconnecting && !connectionError && !isLoading;

  return (
    <div className="flex flex-col gap-4">
      <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg transition-all duration-300
        ${isConnected 
          ? 'bg-gradient-to-r from-blue-900/30 to-blue-800/10 border border-blue-500/30 hover:border-blue-400/50'
          : 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600'
        }`}>
        
        <div className={`p-3 rounded-full flex-shrink-0
          ${isConnected 
            ? 'bg-blue-500/20 text-blue-400'
            : 'bg-gray-700/70 text-gray-400'
          }`}>
          <FaCalendarAlt size={22} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-base font-medium text-gray-200">
              Google Calendar Integration
            </h3>
            {isConnected && !isDisconnecting && (
              <span className="text-green-400 flex items-center text-xs gap-1 bg-green-500/20 px-2 py-0.5 rounded-full">
                <FaCheckCircle size={10} /> Connected
              </span>
            )}
            {isLoading && !isDisconnecting && (
              <span className="text-blue-400 flex items-center text-xs gap-1 bg-blue-500/20 px-2 py-0.5 rounded-full">
                <FaSpinner className="animate-spin" size={10} /> {initialConnected ? "Checking..." : "Connecting..."}
              </span>
            )}
            {isDisconnecting && (
              <span className="text-amber-400 flex items-center text-xs gap-1 bg-amber-500/20 px-2 py-0.5 rounded-full">
                <FaSpinner className="animate-spin" size={10} /> Disconnecting...
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-400">
            {isConnected && !isDisconnecting
              ? 'Your tasks are being synced with Google Calendar'
              : 'Connect your Google Calendar to sync your tasks automatically'}
          </p>
          
          {isConnected && !isDisconnecting && (
            <p className="text-xs text-blue-300/80 mt-1">
              Tasks will sync when you enable "Google Sync" when creating or editing a task
            </p>
          )}
        </div>
        
        <div className="w-full sm:w-auto flex justify-end">
          {isConnected && !isDisconnecting ? (
            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting || isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md
                ${isDisconnecting || isLoading
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600/80 hover:bg-red-600 text-white hover:shadow-lg shadow-red-600/20'
                }`}
            >
              {isDisconnecting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Disconnecting...</span>
                </>
              ) : (
                <>
                  <FaSignOutAlt />
                  <span>Disconnect</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isLoading || isDisconnecting}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all shadow-md
                ${isLoading || isDisconnecting
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white hover:shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30'
                }`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <FaGoogle />
                  <span>Connect with Google</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      {showError && (
        <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30 flex items-start gap-2">
          <FaExclamationTriangle className="text-red-400 mt-0.5" />
          <div>
            <p className="text-sm text-red-300 font-medium">Connection error</p>
            <p className="text-xs text-red-300/80">
              There was a problem with your Google Calendar connection. Please try again or refresh the page.
            </p>
            <button 
              onClick={checkConnection}
              className="mt-2 text-xs bg-red-600/30 hover:bg-red-600/50 text-red-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <FaSpinner className={isLoading ? "animate-spin" : ""} />
              {isLoading ? "Checking..." : "Check Connection Again"}
            </button>
          </div>
        </div>
      )}
      
      {showSuccess && (
        <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30 flex items-start gap-3">
          <div className="bg-blue-500/20 p-2 rounded-full">
            <FaCheckCircle className="text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-blue-300 font-medium">Successfully connected to Google Calendar</p>
            <p className="text-xs text-blue-300/80 mt-1">
              Your tasks will be automatically synced to your Google Calendar when created or updated with the "Google Sync" option enabled.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <p className="text-xs text-green-300">Connection active</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleCalendarSync;