import { Client, Account, Databases } from 'appwrite';

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);

// Generate verification URL
const getVerificationURL = () => {
    const baseURL = import.meta.env.PROD 
        ? 'https://effisense.ayush-sharma.in'
        : 'http://localhost:5173';
    return `${baseURL}/verify-email`;
};

// Send verification email
export const sendVerificationEmail = async () => {
    try {
        await account.createVerification(getVerificationURL());
        return true;
    } catch (error) {
        console.error('Appwrite service error:', error);
        throw error;
    }
};

// Confirm email verification
export const confirmVerification = async (userId, secret) => {
    try {
        await account.updateVerification(userId, secret);
        return true;
    } catch (error) {
        console.error('Email verification error:', error);
        throw error;
    }
};

// Check if user is verified
export const isUserVerified = async () => {
    try {
        const user = await getCurrentUser();
        return user?.emailVerification ?? false;
    } catch (error) {
        console.error('Verification check error:', error);
        return false;
    }
};

// Modified createAccount to store verification requirement flag
export const createAccount = async (email, password, name) => {
    try {
        // First delete any existing sessions
        try {
            await account.deleteSessions();
        } catch (error) {
            console.log('No existing sessions');
        }
        
        // Create account and session
        const createdAccount = await account.create('unique()', email, password, name);
        await account.createEmailPasswordSession(email, password);
        
        // Set verification requirement for new accounts
        sessionStorage.setItem('requiresVerification', 'true');
        sessionStorage.setItem('accountCreatedAt', Date.now().toString());
        
        // Send verification email
        await sendVerificationEmail();
        return createdAccount;
    } catch (error) {
        console.error('Appwrite service error:', error);
        throw error;
    }
};

// Modified login to clear verification flags
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
        
        // Clear any verification requirements for existing users
        sessionStorage.removeItem('requiresVerification');
        sessionStorage.removeItem('accountCreatedAt');
        
        return await account.get();
    } catch (error) {
        console.error('Appwrite service error:', error);
        throw error;
    }
};

// Modified logout to clear all session data
export const logout = async () => {
    try {
        await account.deleteSessions();
        sessionStorage.clear(); // Clear all session data including verification flags
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
    const baseURL = import.meta.env.PROD 
        ? 'https://effisense.ayush-sharma.in'
        : 'http://localhost:5173';
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