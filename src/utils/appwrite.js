import { Client, Account, Databases } from 'appwrite';

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
        await account.create('unique()', email, password, name);
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
    const baseURL = import.meta.env.PROD 
        ? 'https://effisense.vercel.app'
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
