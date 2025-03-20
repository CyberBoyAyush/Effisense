import { databases } from './appwrite';
import { ID, Query } from 'appwrite';
import { account } from './appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_TASKS_COLLECTION_ID;

// Define valid fields that match Appwrite schema
const VALID_TASK_FIELDS = [
    'title',
    'description',
    'deadline',
    'endTime',
    'priority',
    'status',
    'category',
    'userId',
    'syncWithGoogle',
    'isRecurring',
    'recurringType',
    'enableReminders',
    'reminderTime',
    'createdAt',
    'updatedAt'
];

export const createTask = async (taskData, userId) => {
    try {
        // Remove Appwrite system fields and duration field
        const { 
            $id, 
            $databaseId, 
            $collectionId, 
            $createdAt, 
            $updatedAt, 
            duration, // Remove duration as it's not in the schema
            completed, // Remove completed field from input
            ...dirtyData 
        } = taskData;

        // Clean the data to only include valid fields
        const cleanData = Object.keys(dirtyData).reduce((acc, key) => {
            if (VALID_TASK_FIELDS.includes(key)) {
                acc[key] = dirtyData[key];
            }
            return acc;
        }, {});

        // Add required fields
        const task = {
            ...cleanData,
            userId,
            status: cleanData.status || 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            task
        );
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
        // Remove Appwrite system fields and duration field
        const {
            $id,
            $databaseId,
            $collectionId,
            $createdAt,
            $updatedAt,
            duration,
            completed,
            ...dirtyData
        } = taskData;

        // Clean the data
        const cleanData = Object.keys(dirtyData).reduce((acc, key) => {
            if (VALID_TASK_FIELDS.includes(key)) {
                acc[key] = dirtyData[key];
            }
            return acc;
        }, {});

        const task = {
            ...cleanData,
            updatedAt: new Date().toISOString()
        };

        return await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            taskId,
            task
        );
    } catch (error) {
        console.error('Appwrite service error:', error);
        throw error;
    }
};

export const toggleTaskCompletion = async (taskId, isCompleted) => {
    try {
        const taskUpdate = {
            status: isCompleted ? 'completed' : 'pending',
            updatedAt: new Date().toISOString()
        };

        return await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            taskId,
            taskUpdate
        );
    } catch (error) {
        console.error('Appwrite service error:', error);
        throw error;
    }
};

// Helper function to check if a task is completed
export const isTaskCompleted = (task) => {
    return task.status === 'completed';
};

export const getCompletedTasks = async (userId) => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
                Query.equal('userId', userId),
                Query.equal('status', 'completed')
            ]
        );
        
        return response.documents;
    } catch (error) {
        console.error('Appwrite service error:', error);
        throw error;
    }
};

export const getActiveTasks = async (userId) => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
                Query.equal('userId', userId),
                Query.notEqual('status', 'completed') // Changed from Query.any to Query.notEqual
            ]
        );
        
        return response.documents;
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

export const updateUserName = async (userId, name) => {
  try {
    const updatedUser = await account.updateName(name);
    return updatedUser;
  } catch (error) {
    console.error('Error updating user name:', error);
    throw error;
  }
};
