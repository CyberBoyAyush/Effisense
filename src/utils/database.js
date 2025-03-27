import { databases } from './appwrite';
import { ID, Query } from 'appwrite';
import { account } from './appwrite';
import { deleteGoogleCalendarEvent } from './googleCalendar';

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
    'syncWithGoogle', // We only have this flag, not the event ID
    'isRecurring',
    'recurringType',
    'enableReminders',
    'reminderTime',
    'createdAt',
    'updatedAt',
    'completedAt'
    // Removed 'duration' as it doesn't exist in Appwrite schema
];

// Filter object to only include valid fields that exist in Appwrite schema
const filterValidFields = (data) => {
    const validData = {};
    Object.keys(data).forEach(key => {
        if (VALID_TASK_FIELDS.includes(key)) {
            validData[key] = data[key];
        }
    });
    return validData;
};

// Updated createTask to handle Google Calendar integration with syncWithGoogle flag only
export const createTask = async (taskData, userId) => {
    try {
        // Add userId to task
        const data = {
            ...taskData,
            userId: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Remove any googleCalendarEventId from the data
        if (data.googleCalendarEventId) {
            delete data.googleCalendarEventId;
        }
        
        // Filter data to only include valid fields from Appwrite schema
        const validData = filterValidFields(data);
        
        // Create the task in Appwrite
        const response = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            validData
        );
        
        return response;
    } catch (error) {
        console.error('Error creating task:', error);
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

// Updated updateTask to handle Google Calendar integration with syncWithGoogle flag only
export const updateTask = async (taskId, taskData) => {
    try {
        // Add updated timestamp
        const data = {
            ...taskData,
            updatedAt: new Date().toISOString()
        };
        
        // Remove any googleCalendarEventId from the data
        if (data.googleCalendarEventId) {
            delete data.googleCalendarEventId;
        }
        
        // Filter data to only include valid fields from Appwrite schema
        const validData = filterValidFields(data);
        
        // Update the task in Appwrite
        const response = await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            taskId,
            validData
        );
        
        return response;
    } catch (error) {
        console.error('Error updating task:', error);
        throw error;
    }
};

// Updated toggleTaskCompletion to handle Google Calendar integration
export const toggleTaskCompletion = async (taskId, isCompleted) => {
    try {
        // First, get the task to check if it has a Google Calendar event
        const task = await databases.getDocument(
            DATABASE_ID,
            COLLECTION_ID,
            taskId
        );

        const timestamp = new Date().toISOString();
        const taskUpdate = {
            status: isCompleted ? 'completed' : 'pending',
            completedAt: isCompleted ? timestamp : null,
            updatedAt: timestamp
        };

        // Update the task in Appwrite
        const updatedTask = await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            taskId,
            taskUpdate
        );

        // If task has Google Calendar event ID and is now completed, handle calendar event update separately
        // This would typically be done by calling updateGoogleCalendarEvent
        // For this implementation, we'll just ensure the task data is consistent
        
        return updatedTask;
    } catch (error) {
        console.error('Appwrite service error:', error);
        throw error;
    }
};

// Update helper function to use status consistently
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
                Query.notEqual('status', 'completed')
            ]
        );
        
        return response.documents;
    } catch (error) {
        console.error('Appwrite service error:', error);
        throw error;
    }
};

// Updated deleteTask to handle Google Calendar integration with syncWithGoogle flag only
export const deleteTask = async (taskId) => {
    try {
        // First, get the task to check if it has Google Calendar sync enabled
        const task = await databases.getDocument(
            DATABASE_ID,
            COLLECTION_ID,
            taskId
        );
        
        // If task has syncWithGoogle enabled and there's a cached eventId, delete the event from Google Calendar
        if (task && task.syncWithGoogle) {
            // We need to get the Google Calendar event ID from a different source
            // Since we can't store it in Appwrite, we'll use the task ID as a reference
            try {
                // Delete event from Google Calendar by searching for it using task info
                await deleteGoogleCalendarEvent(task.$id, task.title);
            } catch (gcalError) {
                // Log the error but continue with task deletion
                console.error('Failed to delete Google Calendar event:', gcalError);
            }
        }
        
        // Delete the task from Appwrite
        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTION_ID,
            taskId
        );
        
        return true;
    } catch (error) {
        console.error('Error deleting task:', error);
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
