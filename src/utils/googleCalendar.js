// Google Calendar API integration - updated to handle event ID storage

// Constants for Google Calendar API
const API_KEY = null; // Using OAuth instead of API key
const SCOPES = 'https://www.googleapis.com/auth/calendar';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

// Import account from appwrite to store preferences
import { account } from './appwrite';

// User token storage helper functions
const GOOGLE_TOKEN_KEY = 'googleAuthToken';
const GOOGLE_REFRESH_TOKEN_KEY = 'googleRefreshToken';
const GOOGLE_TOKEN_EXPIRY_KEY = 'googleTokenExpiry';
const GOOGLE_EVENT_MAPPINGS_KEY = 'googleEventMappings';

// Store event ID mappings (taskId to Google Calendar eventId)
const storeEventMapping = async (taskId, eventId) => {
  try {
    // Get current user and preferences
    const userData = await account.get();
    const prefs = {...userData.prefs} || {};
    
    // Get existing mappings or create new ones
    const mappingsKey = GOOGLE_EVENT_MAPPINGS_KEY;
    const mappingsStr = prefs[mappingsKey] || '{}';
    const mappings = JSON.parse(mappingsStr);
    
    // Add new mapping
    mappings[taskId] = eventId;
    
    // Update account preferences with new mappings
    await account.updatePrefs({
      [mappingsKey]: JSON.stringify(mappings)
    });
    
    // Also keep a local copy for performance
    sessionStorage.setItem(mappingsKey, JSON.stringify(mappings));
    
    return true;
  } catch (error) {
    console.error('Error storing event mapping:', error);
    return false;
  }
};

// Get event ID for a task
const getEventIdForTask = async (taskId) => {
  try {
    // Try session storage first for performance
    const sessionMappings = sessionStorage.getItem(GOOGLE_EVENT_MAPPINGS_KEY);
    if (sessionMappings) {
      const mappings = JSON.parse(sessionMappings);
      if (mappings[taskId]) {
        return mappings[taskId];
      }
    }
    
    // Fall back to Appwrite preferences
    const userData = await account.get();
    const prefs = userData.prefs || {};
    
    const mappingsStr = prefs[GOOGLE_EVENT_MAPPINGS_KEY] || '{}';
    const mappings = JSON.parse(mappingsStr);
    
    // Update session storage
    sessionStorage.setItem(GOOGLE_EVENT_MAPPINGS_KEY, mappingsStr);
    
    return mappings[taskId] || null;
  } catch (error) {
    console.error('Error getting event ID for task:', error);
    return null;
  }
};

// Remove event mapping
const removeEventMapping = async (taskId) => {
  try {
    // Get current user and preferences
    const userData = await account.get();
    const prefs = {...userData.prefs} || {};
    
    // Get existing mappings
    const mappingsKey = GOOGLE_EVENT_MAPPINGS_KEY;
    const mappingsStr = prefs[mappingsKey] || '{}';
    const mappings = JSON.parse(mappingsStr);
    
    // Remove mapping
    delete mappings[taskId];
    
    // Update account preferences with new mappings
    await account.updatePrefs({
      [mappingsKey]: JSON.stringify(mappings)
    });
    
    // Update session storage
    sessionStorage.setItem(mappingsKey, JSON.stringify(mappings));
    
    return true;
  } catch (error) {
    console.error('Error removing event mapping:', error);
    return false;
  }
};

// Store tokens in Appwrite account preferences securely
export const storeUserTokens = async (tokens) => {
  try {
    // Create preferences object for storing Google tokens
    const prefs = {
      [GOOGLE_TOKEN_KEY]: tokens.access_token,
      [GOOGLE_REFRESH_TOKEN_KEY]: tokens.refresh_token,
      [GOOGLE_TOKEN_EXPIRY_KEY]: Date.now() + (tokens.expires_in * 1000)
    };
    
    // Update account preferences in Appwrite
    await account.updatePrefs(prefs);
    
    // Also store in sessionStorage for immediate access without Appwrite calls
    // but don't use localStorage to avoid inconsistencies
    sessionStorage.setItem(GOOGLE_TOKEN_KEY, tokens.access_token);
    sessionStorage.setItem(GOOGLE_TOKEN_EXPIRY_KEY, prefs[GOOGLE_TOKEN_EXPIRY_KEY]);
    
    return true;
  } catch (error) {
    console.error('Error storing user tokens in Appwrite:', error);
    return false;
  }
};

// Get tokens from Appwrite account preferences
export const getUserTokens = async () => {
  try {
    // First check sessionStorage for immediate access
    const sessionToken = sessionStorage.getItem(GOOGLE_TOKEN_KEY);
    const sessionExpiry = sessionStorage.getItem(GOOGLE_TOKEN_EXPIRY_KEY);
    
    if (sessionToken && sessionExpiry && Date.now() < parseInt(sessionExpiry)) {
      return {
        access_token: sessionToken,
        expires_at: parseInt(sessionExpiry)
      };
    }
    
    // Otherwise check Appwrite account preferences
    const userData = await account.get();
    const prefs = userData.prefs || {};
    
    if (prefs && prefs[GOOGLE_TOKEN_KEY]) {
      const token = prefs[GOOGLE_TOKEN_KEY];
      const expiry = prefs[GOOGLE_TOKEN_EXPIRY_KEY];
      const refreshToken = prefs[GOOGLE_REFRESH_TOKEN_KEY];
      
      if (token && expiry && Date.now() < expiry) {
        // Sync with sessionStorage
        sessionStorage.setItem(GOOGLE_TOKEN_KEY, token);
        sessionStorage.setItem(GOOGLE_TOKEN_EXPIRY_KEY, expiry);
        
        return {
          access_token: token,
          refresh_token: refreshToken,
          expires_at: expiry
        };
      } else if (refreshToken) {
        // Token expired but we have a refresh token
        return { refresh_token: refreshToken };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user tokens from Appwrite:', error);
    return null;
  }
};

// Clear tokens from Appwrite account preferences
export const clearUserTokens = async () => {
  try {
    // Get current preferences
    const userData = await account.get();
    const prefs = {...userData.prefs} || {};
    
    // Remove Google tokens
    delete prefs[GOOGLE_TOKEN_KEY];
    delete prefs[GOOGLE_REFRESH_TOKEN_KEY];
    delete prefs[GOOGLE_TOKEN_EXPIRY_KEY];
    
    // Update Appwrite account preferences
    await account.updatePrefs(prefs);
    
    // Clear session storage as well
    sessionStorage.removeItem(GOOGLE_TOKEN_KEY);
    sessionStorage.removeItem(GOOGLE_TOKEN_EXPIRY_KEY);
    
    return true;
  } catch (error) {
    console.error('Error clearing user tokens from Appwrite:', error);
    return false;
  }
};

// Check if user is signed in to Google
export const checkSignedInStatus = async () => {
  try {
    const tokens = await getUserTokens();
    return tokens && tokens.access_token ? true : false;
  } catch (error) {
    console.error('Error checking signed in status:', error);
    return false;
  }
};

// Generate OAuth URL for redirect
export const getOAuthUrl = () => {
  const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  
  // Ensure we use the exact redirect URI that's registered in Google Cloud Console
  // Format: http://localhost:5173/auth-callback (in development) or https://yourdomain.com/auth-callback (in production)
  const redirectUri = window.location.origin + REDIRECT_URI;
  
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent'
  });
  
  console.log("OAuth URL generated with redirect URI:", redirectUri);
  return `${baseUrl}?${params.toString()}`;
};

// Handle Google Calendar authentication
export const handleGoogleAuth = () => {
  // Redirect to Google OAuth URL
  window.location.href = getOAuthUrl();
};

// Exchange authorization code for tokens using server-side proxy
export const exchangeCodeForTokens = async (code) => {
  try {
    // Check if we're in development environment
    const isDevelopment = import.meta.env.MODE === 'development';
    
    // In development, we'll implement a direct token exchange since our API endpoints aren't available
    if (isDevelopment) {
      console.log("Running in development mode, implementing direct token exchange");
      
      const redirectUri = window.location.origin + REDIRECT_URI;
      const tokenUrl = 'https://oauth2.googleapis.com/token';
      
      // Using client secret from environment variable
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code
      });
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to exchange code for tokens');
      }
      
      const tokens = await response.json();
      
      // Store tokens securely in user preferences
      storeUserTokens(tokens);
      
      return true;
    } 
    
    // Production flow - use the server-side proxy
    console.log("Using server-side proxy for token exchange");
    
    // Use our server-side proxy to exchange the code for tokens securely
    const response = await fetch('/api/oauth-token-exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code })
    });
    
    if (!response.ok) {
      console.error("Error response status:", response.status);
      console.error("Error response text:", await response.text());
      throw new Error('Failed to exchange code for tokens');
    }
    
    const tokens = await response.json();
    
    // Store tokens securely in user preferences
    storeUserTokens(tokens);
    
    return true;
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    throw error;
  }
};

// Refresh token if expired
export const refreshAccessToken = async () => {
  try {
    const tokens = await getUserTokens();
    
    if (!tokens || !tokens.refresh_token) {
      throw new Error('No refresh token available');
    }
    
    // Check if we're in development environment
    const isDevelopment = import.meta.env.MODE === 'development';
    
    if (isDevelopment) {
      // Direct token refresh for development mode
      const tokenUrl = 'https://oauth2.googleapis.com/token';
      
      // Using client secret from environment variable
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: tokens.refresh_token,
        grant_type: 'refresh_token'
      });
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh access token');
      }
      
      const newTokens = await response.json();
      
      // Add refresh token as it's not included in the response
      newTokens.refresh_token = tokens.refresh_token;
      
      // Store updated tokens
      storeUserTokens(newTokens);
      
      return true;
    }
    
    // Production flow - use server-side proxy
    // Call server-side proxy to refresh token
    const response = await fetch('/api/oauth-refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken: tokens.refresh_token })
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }
    
    const newTokens = await response.json();
    
    // Add refresh token as it's not included in the response
    newTokens.refresh_token = tokens.refresh_token;
    
    // Store updated tokens
    storeUserTokens(newTokens);
    
    return true;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    // Clear tokens on refresh error
    clearUserTokens();
    throw error;
  }
};

// Sign out from Google
export const signOutFromGoogle = async () => {
  try {
    // Clear tokens from storage
    clearUserTokens();
    return true;
  } catch (error) {
    console.error('Error signing out from Google:', error);
    throw error;
  }
};

// Helper to ensure we have a valid token
const ensureValidToken = async () => {
  const tokens = await getUserTokens();
  
  if (!tokens) {
    throw new Error('User not authenticated with Google');
  }
  
  if (tokens.access_token && tokens.expires_at && Date.now() < tokens.expires_at) {
    return tokens.access_token;
  }
  
  if (tokens.refresh_token) {
    await refreshAccessToken();
    const newTokens = await getUserTokens();
    return newTokens.access_token;
  }
  
  throw new Error('Unable to get valid access token');
};

// Make an API request with valid token
const makeGoogleApiRequest = async (url, method = 'GET', body = null) => {
  try {
    const accessToken = await ensureValidToken();
    
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API request failed: ${response.status} ${errorText}`);
    }
    
    // For methods like DELETE that don't return JSON, just return success
    if (method === 'DELETE') {
      return { success: true };
    }
    
    // Only parse JSON for responses that have it
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error('Google API request failed:', error);
    throw error;
  }
};

// Create a Google Calendar event for a task
export const createGoogleCalendarEvent = async (task) => {
  try {
    console.log('Creating Google Calendar event for task:', task);
    
    // Ensure we have the required fields
    if (!task.title || !task.deadline) {
      throw new Error('Task must have title and deadline to create a calendar event');
    }
    
    // Format the event
    const event = {
      summary: task.title,
      description: task.description || '',
      start: {
        dateTime: new Date(task.deadline).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: task.endTime ? new Date(task.endTime).toISOString() : 
          new Date(new Date(task.deadline).getTime() + (parseInt(task.duration || 60) * 60000)).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      reminders: {
        useDefault: false,
        overrides: task.enableReminders ? [
          { method: 'popup', minutes: parseInt(task.reminderTime || 15) }
        ] : []
      },
      colorId: getColorIdForTask(task)
    };
    
    console.log('Google Calendar event data:', event);
    
    // Make API call to create event
    const response = await makeGoogleApiRequest(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      'POST',
      event
    );
    
    console.log('Google Calendar API response:', response);
    
    // Store mapping between task ID and Google Calendar event ID
    if (response && response.id) {
      console.log('Storing event mapping:', task.$id, response.id);
      await storeEventMapping(task.$id, response.id);
    } else {
      console.error('No event ID returned from Google Calendar API');
    }
    
    return response;
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    throw error;
  }
};

// Update a Google Calendar event for a task
export const updateGoogleCalendarEvent = async (task) => {
  try {
    // Get the Google Calendar event ID for this task
    const eventId = await getEventIdForTask(task.$id);
    
    if (!eventId) {
      // If no mapping exists, create a new event instead
      return createGoogleCalendarEvent(task);
    }
    
    // Format the event
    const event = {
      summary: task.title,
      description: task.description || '',
      start: {
        dateTime: new Date(task.deadline).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: task.endTime ? new Date(task.endTime).toISOString() : 
          new Date(new Date(task.deadline).getTime() + (parseInt(task.duration || 60) * 60000)).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      reminders: {
        useDefault: false,
        overrides: task.enableReminders ? [
          { method: 'popup', minutes: parseInt(task.reminderTime || 15) }
        ] : []
      }
    };
    
    // Make API call to update event
    const response = await makeGoogleApiRequest(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      'PUT',
      event
    );
    
    return response;
  } catch (error) {
    console.error('Error updating Google Calendar event:', error);
    throw error;
  }
};

// Delete a Google Calendar event for a task
export const deleteGoogleCalendarEvent = async (taskId) => {
  try {
    // Get the Google Calendar event ID for this task
    const eventId = await getEventIdForTask(taskId);
    
    if (!eventId) {
      console.log('No Google Calendar event found for task', taskId);
      return { success: false, reason: 'no_event_found' };
    }
    
    // Make API call to delete event
    const response = await makeGoogleApiRequest(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      'DELETE'
    );
    
    // Remove the mapping between task ID and Google Calendar event
    if (response.success) {
      await removeEventMapping(taskId);
    }
    
    return response;
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    throw error;
  }
};

// List Google Calendar events within a time range
export const listGoogleCalendarEvents = async (timeMin, timeMax) => {
  try {
    const params = new URLSearchParams({
      timeMin: new Date(timeMin).toISOString(),
      timeMax: new Date(timeMax).toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    const response = await makeGoogleApiRequest(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`
    );
    
    return response;
  } catch (error) {
    console.error('Error listing Google Calendar events:', error);
    throw error;
  }
};

// Get color ID based on task properties
const getColorIdForTask = (task) => {
  // Google Calendar color IDs:
  // 1: Blue, 2: Green, 3: Purple, 4: Red, 5: Yellow,
  // 6: Orange, 7: Turquoise, 8: Gray, 9: Bold Blue, 10: Bold Green
  // 11: Bold Red

  if (task.status === 'completed') {
    return '8'; // Gray for completed tasks
  }
  
  switch (task.priority) {
    case 'high':
      return '11'; // Bold Red for high priority
    case 'medium':
      return '6';  // Orange for medium priority
    case 'low':
      return '2';  // Green for low priority
    default:
      return '1';  // Blue for default
  }
};