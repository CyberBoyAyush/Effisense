import { Client, Account, Databases, ID } from 'appwrite';

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);

// Auth helper functions
export const createAccount = async (email, password, name) => {
    try {
        // First delete any existing sessions
        try {
            await account.deleteSessions();
        } catch (error) {
            console.log('No existing sessions');
        }
        
        // Create account and session
        await account.create(ID.unique(), email, password, name);
        await account.createEmailPasswordSession(email, password);
        return await account.get();
    } catch (error) {
        console.error('Appwrite service error:', error);
        throw error;
    }
};

export const login = async (email, password) => {
    try {
        // First delete any existing sessions
        try {
            await account.deleteSessions();
        } catch (error) {
            console.log('No existing sessions');
        }
        
        // Create new session
        await account.createEmailPasswordSession(email, password);
        return await account.get();
    } catch (error) {
        console.error('Appwrite service error:', error);
        throw error;
    }
};

// Get the base URL for redirects
const getBaseURL = () => {
    return import.meta.env.PROD 
        ? 'https://effisense.vercel.app'
        : 'http://localhost:5173';
};

// Create Google OAuth session with forced session cleanup
export const createGoogleOAuthSession = async (redirectPage = 'dashboard') => {
    try {
        console.log('Starting Google OAuth login process...');
        
        // Generate unique OAuth state for this attempt
        const oauthState = `oauth_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        
        // Store minimal OAuth tracking data in sessionStorage (persists better through redirects)
        // Using sessionStorage instead of localStorage to better handle redirects
        sessionStorage.setItem('oauth_state', oauthState);
        sessionStorage.setItem('oauth_in_progress', 'true');
        sessionStorage.setItem('oauth_redirect', redirectPage);
        sessionStorage.setItem('oauth_timestamp', Date.now().toString());
        
        // Clear localStorage items that might conflict
        localStorage.removeItem('oauth_state');
        localStorage.removeItem('oauth_in_progress');
        
        // Delete all existing Appwrite sessions with proper error handling
        try {
            console.log('Clearing existing sessions...');
            await account.deleteSessions();
            
            // Add a deliberate delay to ensure session deletion completes server-side
            await new Promise(resolve => setTimeout(resolve, 800));
        } catch (error) {
            console.warn('Error during session cleanup, continuing anyway:', error);
        }
        
        // Set up redirect URLs with state parameter for security
        const baseUrl = getBaseURL();
        const successUrl = `${baseUrl}/oauth-callback?success=true&state=${oauthState}`;
        const failureUrl = `${baseUrl}/oauth-callback?success=false&state=${oauthState}`;
        
        console.log('Redirecting to Google OAuth with state:', oauthState);
        
        // Use direct URL construction for better control
        const authURL = new URL(`${import.meta.env.VITE_APPWRITE_ENDPOINT}/account/sessions/oauth2/google`);
        authURL.searchParams.append('project', import.meta.env.VITE_APPWRITE_PROJECT_ID);
        authURL.searchParams.append('success', successUrl);
        authURL.searchParams.append('failure', failureUrl);
        
        // Redirect to OAuth provider
        window.location.href = authURL.toString();
        return true;
    } catch (error) {
        console.error('Google OAuth initialization error:', error);
        sessionStorage.removeItem('oauth_state');
        sessionStorage.removeItem('oauth_in_progress');
        throw error;
    }
};

// Create account from Google OAuth session - to be called in OAuth callback
export const createAccountFromOAuthSession = async () => {
    try {
        console.log('Creating/fetching account from OAuth session...');
        
        // Get current session to extract provider information
        const session = await account.getSession('current');
        if (!session) {
            throw new Error('No valid OAuth session found');
        }
        
        if (session.provider !== 'google') {
            throw new Error(`Expected Google auth but found: ${session.provider}`);
        }
        
        console.log('Valid Google session found with ID:', session.$id);
        
        try {
            // First, try to get existing user account
            const user = await account.get();
            console.log('Existing user found:', user.name);
            return user;
        } catch (error) {
            // User doesn't exist yet - we need to create one
            if (error.code === 401) {
                console.log('No existing user account. Creating new account from OAuth profile...');
                
                // Get user profile from Google using access token
                const googleProfile = await fetchGoogleProfile(session.providerAccessToken);
                
                if (!googleProfile || !googleProfile.email) {
                    throw new Error('Google profile missing required data');
                }
                
                // Generate a secure random password for the new account
                const randomPassword = generateSecurePassword();
                
                try {
                    // Create the Appwrite account
                    await account.create(
                        ID.unique(),
                        googleProfile.email,
                        randomPassword,
                        googleProfile.name || googleProfile.given_name || 'Google User'
                    );
                    console.log('Account created successfully for:', googleProfile.email);
                    
                    // Get the newly created account
                    return await account.get();
                } catch (createError) {
                    // Special handling for email already exists error
                    if (createError.code === 409) {
                        console.log('Account exists but session was valid - possible edge case');
                        return await account.get();
                    }
                    throw createError;
                }
            } else {
                throw error; // Re-throw unexpected errors
            }
        }
    } catch (error) {
        console.error('Error creating/fetching account from OAuth session:', error);
        throw error;
    }
};

// Helper function to fetch Google profile data
async function fetchGoogleProfile(accessToken) {
    try {
        console.log('Fetching user profile from Google...');
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch Google profile: ${response.status}`);
        }
        
        const profile = await response.json();
        console.log('Google profile fetched successfully');
        return profile;
    } catch (error) {
        console.error('Error fetching Google profile:', error);
        throw error;
    }
}

// Helper function to generate secure random password
function generateSecurePassword() {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_-+={}[]\\|:;"\'<>,.?/';
    
    // Ensure at least one of each character type
    let password = 
        lowercase.charAt(Math.floor(Math.random() * lowercase.length)) +
        uppercase.charAt(Math.floor(Math.random() * uppercase.length)) +
        numbers.charAt(Math.floor(Math.random() * numbers.length)) +
        special.charAt(Math.floor(Math.random() * special.length));
    
    // Add more random characters
    for (let i = 0; i < 12; i++) {
        const allChars = lowercase + uppercase + numbers + special;
        password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
}

// Improved function to forcefully clear all sessions and oauth state
export const forceLogout = async () => {
    // Clear localStorage
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('oauth_in_progress');
    
    // Delete all sessions
    try {
        await account.deleteSessions();
        console.log('All sessions deleted successfully');
    } catch (error) {
        console.log('Error deleting sessions or no sessions to delete:', error);
    }

    return true;
};

// Get current session info
export const getSession = async () => {
    try {
        return await account.getSession('current');
    } catch (error) {
        console.error('Session retrieval error:', error);
        return null;
    }
};

// Create or get a user from OAuth
export const handleOAuthSession = async () => {
    try {
        // First check if we have a valid session
        const session = await getSession();
        
        if (!session) {
            console.log('No valid OAuth session found');
            return null;
        }
        
        console.log('OAuth session found:', session);
        
        // For OAuth sessions, we need to ensure the account exists
        if (session.provider !== 'email') {
            try {
                // Try to get user account (if exists)
                return await account.get();
            } catch (error) {
                // If error code is 401, the session is valid but the user doesn't exist yet
                if (error.code === 401) {
                    console.log('Creating new account from OAuth session');
                    
                    try {
                        // Get user info from the provider
                        const { provider, providerUid, providerAccessToken } = session;
                        
                        if (provider === 'google') {
                            // Fetch user data from Google
                            const googleUserInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                                headers: { Authorization: `Bearer ${providerAccessToken}` }
                            }).then(res => {
                                if (!res.ok) throw new Error('Failed to fetch Google profile');
                                return res.json();
                            });
                            
                            console.log('Google user info:', googleUserInfo);
                            
                            if (!googleUserInfo.email) {
                                throw new Error('Email not provided by Google');
                            }
                            
                            // Generate a secure random password since the user will always use OAuth to login
                            const randomPassword = Math.random().toString(36).slice(-10) + 
                                Math.random().toString(36).toUpperCase().slice(-2) + 
                                Math.random().toString(10).slice(-1) + '!';
                            
                            try {
                                // First, try to create the account
                                await account.create(
                                    ID.unique(),
                                    googleUserInfo.email,
                                    randomPassword,
                                    googleUserInfo.name || googleUserInfo.given_name || 'Google User'
                                );
                                
                                console.log('Account created successfully');
                                
                                // Now create a new session to ensure it's valid
                                await account.deleteSession('current');
                                
                                // Now create new OAuth session
                                const baseUrl = getBaseURL();
                                const successUrl = `${baseUrl}/oauth-callback?success=true&redirect=dashboard`;
                                const failureUrl = `${baseUrl}/oauth-callback?success=false`;
                                
                                await account.createOAuth2Session(
                                    'google',
                                    successUrl,
                                    failureUrl
                                );
                                
                                return await account.get();
                            } catch (createError) {
                                // If account already exists (409), try to link the identity
                                if (createError.code === 409) {
                                    console.log('Email already exists, attempting to login and link identities');
                                    
                                    try {
                                        // Try to get current account (should work since we have a valid session)
                                        return await account.get();
                                    } catch (sessionError) {
                                        console.error('Failed to get account after 409:', sessionError);
                                        throw new Error('Account exists but could not be accessed. Please login with email first.');
                                    }
                                } else {
                                    console.error('Account creation failed:', createError);
                                    throw createError;
                                }
                            }
                        } else {
                            throw new Error(`Unsupported provider: ${provider}`);
                        }
                    } catch (profileError) {
                        console.error('Error processing OAuth profile:', profileError);
                        throw profileError;
                    }
                } else {
                    console.error('Error getting user account:', error);
                    throw error;
                }
            }
        } else {
            // For email sessions, just return the current user
            return await account.get();
        }
    } catch (error) {
        console.error('OAuth session handling error:', error);
        throw error;
    }
};

// Directly create account from OAuth profile (alternative approach)
export const createAccountFromOAuth = async (provider = 'google') => {
    try {
        // First get the session
        const session = await getSession();
        
        if (!session || session.provider !== provider) {
            throw new Error(`No active ${provider} session found`);
        }
        
        // Get profile data from provider
        let userData = null;
        
        if (provider === 'google') {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${session.providerAccessToken}` }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch Google profile');
            }
            
            userData = await response.json();
        } else {
            throw new Error(`Unsupported provider: ${provider}`);
        }
        
        if (!userData || !userData.email) {
            throw new Error('Could not get email from provider');
        }
        
        // Create a secure password that the user won't need to use
        const randomPassword = Math.random().toString(36).slice(-10) +
            Math.random().toString(36).toUpperCase().slice(-2) +
            Math.random().toString(10).slice(-1) + '!';
        
        try {
            // Create the account (this will fail if account exists)
            await account.create(
                ID.unique(),
                userData.email,
                randomPassword,
                userData.name || userData.given_name || `${provider} User`
            );
            
            console.log('Account created successfully from OAuth');
        } catch (err) {
            // If account already exists, that's fine - we have an active session
            if (err.code !== 409) {
                throw err;
            }
            console.log('Account already exists, continuing with current session');
        }
        
        // Return current user
        return await account.get();
    } catch (error) {
        console.error('Create account from OAuth error:', error);
        throw error;
    }
};

// Update/refresh the OAuth session - avoid refresh token errors
export const updateOAuthSession = async (sessionId = 'current') => {
    try {
        // First check if session exists and is refreshable
        try {
            const session = await account.getSession(sessionId);
            
            // Only try to update session if it's not OAuth or has a refresh token
            if (session.provider === 'email') {
                return await account.updateSession(sessionId);
            } else {
                // For OAuth sessions without refresh tokens, just return the current session
                console.log('OAuth session found but skipping refresh (not supported)');
                return session;
            }
        } catch (err) {
            console.log('No session to update or session not refreshable');
            return null;
        }
    } catch (error) {
        console.error('Session update error:', error);
        return null;
    }
};

export const logout = async () => {
    try {
        await account.deleteSessions();
        return true;
    } catch (error) {
        console.error('Appwrite service error:', error);
        throw error;
    }
};

export const getCurrentUser = async () => {
    try {
        return await account.get();
    } catch (error) {
        console.error('Appwrite service error:', error);
        return null;
    }
};

const getResetPasswordURL = () => {
    const baseURL = getBaseURL();
    return `${baseURL}/reset-password`;
};

export const resetPassword = async (email) => {
    try {
        await account.createRecovery(email, getResetPasswordURL());
        return true;
    } catch (error) {
        console.error('Appwrite service error:', error);
        throw error;
    }
};

export const confirmPasswordReset = async (userId, secret, newPassword) => {
  try {
    // We'll simplify the validation and defer to Appwrite's built-in validation
    // Only perform basic length check client-side
    if (newPassword.length < 8) {
      throw { code: 400, message: "Password must be at least 8 characters long" };
    }

    // Call Appwrite password recovery API
    // We need to pass the same password twice (for new password and password confirmation)
    await account.updateRecovery(
      userId,
      secret,
      newPassword,
      newPassword
    );
    
    return true;
  } catch (error) {
    console.error('Password reset error:', error);
    
    // Better error handling for Appwrite specific errors
    if (error.code === 400) {
      // Parse Appwrite's error message to provide more specific feedback
      if (error.message.includes('password')) {
        throw { 
          code: 400, 
          message: "Password must be at least 8 characters and include a mix of characters"
        };
      }
    }
    
    // Pass through the original error if not handled above
    throw error;
  }
};