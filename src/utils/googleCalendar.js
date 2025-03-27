// Google Calendar API integration - updated to handle event ID storage

// Constants for Google Calendar API
const API_KEY = null; // Using OAuth instead of API key
const SCOPES = 'https://www.googleapis.com/auth/calendar';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

// User token storage helper functions
const GOOGLE_TOKEN_KEY = 'googleAuthToken';
const GOOGLE_REFRESH_TOKEN_KEY = 'googleRefreshToken';
const GOOGLE_TOKEN_EXPIRY_KEY = 'googleTokenExpiry';
const GOOGLE_EVENT_MAPPINGS_KEY = 'googleEventMappings';

// Store event ID mappings (taskId to Google Calendar eventId)
const storeEventMapping = (taskId, eventId) => {
  try {
    // Get existing mappings
    const mappingsStr = localStorage.getItem(GOOGLE_EVENT_MAPPINGS_KEY) || '{}';
    const mappings = JSON.parse(mappingsStr);
    
    // Add new mapping
    mappings[taskId] = eventId;
    
    // Save updated mappings
    localStorage.setItem(GOOGLE_EVENT_MAPPINGS_KEY, JSON.stringify(mappings));
    return true;
  } catch (error) {
    console.error('Error storing event mapping:', error);
    return false;
  }
};

// Get event ID for a task
const getEventIdForTask = (taskId) => {
  try {
    const mappingsStr = localStorage.getItem(GOOGLE_EVENT_MAPPINGS_KEY) || '{}';
    const mappings = JSON.parse(mappingsStr);
    return mappings[taskId];
  } catch (error) {
    console.error('Error getting event ID for task:', error);
    return null;
  }
};

// Remove event mapping
const removeEventMapping = (taskId) => {
  try {
    const mappingsStr = localStorage.getItem(GOOGLE_EVENT_MAPPINGS_KEY) || '{}';
    const mappings = JSON.parse(mappingsStr);
    delete mappings[taskId];
    localStorage.setItem(GOOGLE_EVENT_MAPPINGS_KEY, JSON.stringify(mappings));
    return true;
  } catch (error) {
    console.error('Error removing event mapping:', error);
    return false;
  }
};

// Store tokens in user preferences securely
export const storeUserTokens = (tokens) => {
  try {
    const userData = JSON.parse(localStorage.getItem('loggedInUser')) || {};
    
    // Create preferences object if it doesn't exist
    if (!userData.preferences) {
      userData.preferences = {};
    }
    
    // Store tokens in user preferences
    userData.preferences[GOOGLE_TOKEN_KEY] = tokens.access_token;
    userData.preferences[GOOGLE_REFRESH_TOKEN_KEY] = tokens.refresh_token;
    userData.preferences[GOOGLE_TOKEN_EXPIRY_KEY] = Date.now() + (tokens.expires_in * 1000);
    
    // Save updated user data
    localStorage.setItem('loggedInUser', JSON.stringify(userData));
    
    // Also store in sessionStorage for immediate access
    sessionStorage.setItem(GOOGLE_TOKEN_KEY, tokens.access_token);
    sessionStorage.setItem(GOOGLE_TOKEN_EXPIRY_KEY, userData.preferences[GOOGLE_TOKEN_EXPIRY_KEY]);
    
    return true;
  } catch (error) {
    console.error('Error storing user tokens:', error);
    return false;
  }
};

// Get tokens from user preferences
export const getUserTokens = () => {
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
    
    // Otherwise check user preferences in localStorage
    const userData = JSON.parse(localStorage.getItem('loggedInUser')) || {};
    
    if (userData.preferences && userData.preferences[GOOGLE_TOKEN_KEY]) {
      const token = userData.preferences[GOOGLE_TOKEN_KEY];
      const expiry = userData.preferences[GOOGLE_TOKEN_EXPIRY_KEY];
      const refreshToken = userData.preferences[GOOGLE_REFRESH_TOKEN_KEY];
      
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
    console.error('Error getting user tokens:', error);
    return null;
  }
};

// Clear tokens from user preferences
export const clearUserTokens = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('loggedInUser')) || {};
    
    if (userData.preferences) {
      delete userData.preferences[GOOGLE_TOKEN_KEY];
      delete userData.preferences[GOOGLE_REFRESH_TOKEN_KEY];
      delete userData.preferences[GOOGLE_TOKEN_EXPIRY_KEY];
      
      localStorage.setItem('loggedInUser', JSON.stringify(userData));
    }
    
    // Clear session storage as well
    sessionStorage.removeItem(GOOGLE_TOKEN_KEY);
    sessionStorage.removeItem(GOOGLE_TOKEN_EXPIRY_KEY);
    
    return true;
  } catch (error) {
    console.error('Error clearing user tokens:', error);
    return false;
  }
};

// Check if user is signed in to Google
export const checkSignedInStatus = () => {
  const tokens = getUserTokens();
  return tokens && tokens.access_token ? true : false;
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
    const tokens = getUserTokens();
    
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
  const tokens = getUserTokens();
  
  if (!tokens) {
    throw new Error('User not authenticated with Google');
  }
  
  if (tokens.access_token && tokens.expires_at && Date.now() < tokens.expires_at) {
    return tokens.access_token;
  }
  
  if (tokens.refresh_token) {
    await refreshAccessToken();
    const newTokens = getUserTokens();
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
      const error = await response.json();
      throw new Error(`Google API error: ${error.error?.message || 'Unknown error'}`);
    }
    
    if (method === 'DELETE') {
      return true;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Google API request error:', error);
    throw error;
  }
};

// Create a Google Calendar event from a task
export const createGoogleCalendarEvent = async (task) => {
  try {
    // Format event times from task
    const startDateTime = new Date(task.deadline);
    const endDateTime = task.endTime ? new Date(task.endTime) : new Date(startDateTime.getTime() + 60 * 60 * 1000);

    // Create the event object
    const event = {
      'summary': task.title,
      'description': task.description || '',
      'start': {
        'dateTime': startDateTime.toISOString(),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      'end': {
        'dateTime': endDateTime.toISOString(),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      'colorId': getColorIdForTask(task),
      'reminders': {
        'useDefault': !task.enableReminders,
        'overrides': task.enableReminders ? [
          {'method': 'popup', 'minutes': parseInt(task.reminderTime) || 15}
        ] : []
      }
    };

    // Add the event to Google Calendar using our API request helper
    const calendarEventUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
    const response = await makeGoogleApiRequest(calendarEventUrl, 'POST', event);
    
    // Store the mapping between task ID and event ID
    if (task.$id) {
      storeEventMapping(task.$id, response.id);
    }

    // Return the event ID from Google Calendar
    return response.id;
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    throw error;
  }
};

// Update a Google Calendar event based on task changes
export const updateGoogleCalendarEvent = async (task) => {
  try {
    // Get the Google Calendar event ID for this task
    const eventId = getEventIdForTask(task.$id);
    
    if (!eventId) {
      // If no event ID is found, create a new event instead
      return await createGoogleCalendarEvent(task);
    }

    // Format event times from task
    const startDateTime = new Date(task.deadline);
    const endDateTime = task.endTime ? new Date(task.endTime) : new Date(startDateTime.getTime() + 60 * 60 * 1000);

    // Create the event object
    const event = {
      'summary': task.title,
      'description': task.description || '',
      'start': {
        'dateTime': startDateTime.toISOString(),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      'end': {
        'dateTime': endDateTime.toISOString(),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      'colorId': getColorIdForTask(task),
      'reminders': {
        'useDefault': !task.enableReminders,
        'overrides': task.enableReminders ? [
          {'method': 'popup', 'minutes': parseInt(task.reminderTime) || 15}
        ] : []
      }
    };

    // Update the event in Google Calendar
    const calendarEventUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;
    const response = await makeGoogleApiRequest(calendarEventUrl, 'PUT', event);

    // Return the event ID from Google Calendar
    return response.id;
  } catch (error) {
    console.error('Error updating Google Calendar event:', error);
    // If the event was not found, it might have been deleted from Google Calendar
    // Try to create a new event instead
    if (error.message && error.message.includes('not found')) {
      return await createGoogleCalendarEvent(task);
    }
    throw error;
  }
};

// Delete a Google Calendar event
export const deleteGoogleCalendarEvent = async (taskId, taskTitle) => {
  try {
    // Get the event ID from our mappings
    const eventId = getEventIdForTask(taskId);
    
    if (!eventId) {
      console.log(`No Google Calendar event found for task: ${taskId} - ${taskTitle}`);
      return false;
    }
    
    // Delete the event from Google Calendar
    const calendarEventUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;
    await makeGoogleApiRequest(calendarEventUrl, 'DELETE');
    
    // Remove the mapping
    removeEventMapping(taskId);

    return true;
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    // Remove the mapping anyway to prevent future errors
    removeEventMapping(taskId);
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