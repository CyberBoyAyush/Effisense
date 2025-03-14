import { databases } from './appwrite';
import { ID, Query } from 'appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_TASKS_COLLECTION_ID;

export const createTask = async (taskData, userId) => {
    try {
        const task = {
            ...taskData,
            userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const response = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            task
        );

        return response;
    } catch (error) {
        console.error('Appwrite service error:', error);
        throw error;
    }
};

export const getUserTasks = async (userId) => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Query.equal('userId', userId)]
        );
        
        return response.documents;
    } catch (error) {
        console.error('Appwrite service error:', error);
        throw error;
    }
};

export const updateTask = async (taskId, taskData) => {
    try {
        const task = {
            ...taskData,
            updatedAt: new Date().toISOString()
        };

        const response = await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            taskId,
            task
        );

        return response;
    } catch (error) {
        console.error('Appwrite service error:', error);
        throw error;
    }
};

export const deleteTask = async (taskId) => {
    try {
        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTION_ID,
            taskId
        );
        return true;
    } catch (error) {
        console.error('Appwrite service error:', error);
        throw error;
    }
};
