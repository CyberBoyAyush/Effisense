import { databases } from './appwrite';
import { ID, Query } from 'appwrite';
import { account } from './appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_TASKS_COLLECTION_ID;

// Local task cache to improve performance and reliability
const localTaskCache = {
  tasks: [],
  lastFetched: null,
  setTasks: function(tasks) {
    this.tasks = tasks;
    this.lastFetched = new Date();
    // Also store in localStorage for persistence between page reloads
    localStorage.setItem('effisense_task_cache', JSON.stringify({
      tasks,
      lastFetched: this.lastFetched
    }));
  },
  getTask: function(taskId) {
    return this.tasks.find(task => task.$id === taskId);
  },
  updateTask: function(taskId, updates) {
    const index = this.tasks.findIndex(task => task.$id === taskId);
    if (index !== -1) {
      this.tasks[index] = { ...this.tasks[index], ...updates };
      // Update localStorage
      localStorage.setItem('effisense_task_cache', JSON.stringify({
        tasks: this.tasks,
        lastFetched: this.lastFetched
      }));
      return this.tasks[index];
    }
    return null;
  },
  addTask: function(task) {
    this.tasks.push(task);
    // Update localStorage
    localStorage.setItem('effisense_task_cache', JSON.stringify({
      tasks: this.tasks,
      lastFetched: this.lastFetched
    }));
  },
  removeTask: function(taskId) {
    this.tasks = this.tasks.filter(task => task.$id !== taskId);
    // Update localStorage
    localStorage.setItem('effisense_task_cache', JSON.stringify({
      tasks: this.tasks,
      lastFetched: this.lastFetched
    }));
  },
  initialize: function() {
    // Load from localStorage if available
    try {
      const cached = localStorage.getItem('effisense_task_cache');
      if (cached) {
        const { tasks, lastFetched } = JSON.parse(cached);
        this.tasks = tasks || [];
        this.lastFetched = new Date(lastFetched) || null;
      }
    } catch (error) {
      console.error('Error initializing task cache:', error);
    }
  }
};

// Initialize the cache
localTaskCache.initialize();

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
        const { $id, $databaseId, $collectionId, $createdAt, $updatedAt, duration, ...dirtyData } = taskData;

        const cleanData = Object.keys(dirtyData).reduce((acc, key) => {
            if (VALID_TASK_FIELDS.includes(key)) {
                acc[key] = dirtyData[key];
            }
            return acc;
        }, {});

        const task = {
            ...cleanData,
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

        // Add to local cache only after successful creation
        if (response) {
            localTaskCache.addTask(response);
        }
        
        return response;
    } catch (error) {
        console.error('Appwrite service error:', error);
        throw error;
    }
};

export const getUserTasks = async (userId) => {
    try {
        // If we have a recent cache within 5 minutes, use it
        const cacheAge = localTaskCache.lastFetched ? 
            (new Date() - localTaskCache.lastFetched) / 1000 / 60 : 
            Infinity;
            
        if (localTaskCache.tasks.length > 0 && cacheAge < 5) {
            return localTaskCache.tasks;
        }
        
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Query.equal('userId', userId)]
        );
        
        // Update local cache
        localTaskCache.setTasks(response.documents);
        
        return response.documents;
    } catch (error) {
        console.error('Appwrite service error:', error);
        // If network fails, return cached data if available
        if (localTaskCache.tasks.length > 0) {
            return localTaskCache.tasks;
        }
        throw error;
    }
};

export const updateTask = async (taskId, taskData) => {
    try {
        // Ensure completion status is properly set as a boolean
        if (taskData.hasOwnProperty('completed')) {
            taskData.completed = Boolean(taskData.completed);
        }

        const task = {
            ...taskData,
            updatedAt: new Date().toISOString()
        };

        // Update local cache immediately for responsive UI
        localTaskCache.updateTask(taskId, task);
        
        // Then update Appwrite database
        const response = await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            taskId,
            task
        );

        // Update local cache with server response
        localTaskCache.updateTask(taskId, response);
        
        return response;
    } catch (error) {
        console.error('Appwrite service error:', error);
        // Return local cache version to keep UI consistent
        return localTaskCache.getTask(taskId);
    }
};

// Specialized function for toggling completion status - Updated to handle status enum
export const toggleTaskCompletion = async (taskId, isCompleted) => {
    try {
        // Convert to boolean explicitly to ensure proper data type
        isCompleted = Boolean(isCompleted);
        
        // First try to get the current document to determine which fields exist
        const existingTask = await databases.getDocument(
            DATABASE_ID,
            COLLECTION_ID,
            taskId
        );
        
        console.log('Existing task schema:', Object.keys(existingTask));
        
        // Create update payload based on existing fields in the document
        let taskUpdate = {
            updatedAt: new Date().toISOString()
        };
        
        // Always update status enum field to the correct value based on completion state
        if ('status' in existingTask) {
            taskUpdate.status = isCompleted ? 'completed' : 'pending';
        }
        
        // Also update the other possible completion fields for compatibility
        if ('isCompleted' in existingTask) {
            taskUpdate.isCompleted = isCompleted;
        } 
        
        if ('is_completed' in existingTask) {
            taskUpdate.is_completed = isCompleted;
        }
        
        // Handle completion timestamp based on existing fields
        if (isCompleted) {
            if ('completedAt' in existingTask) {
                taskUpdate.completedAt = new Date().toISOString();
            } else if ('completed_at' in existingTask) {
                taskUpdate.completed_at = new Date().toISOString();
            } else if ('completionDate' in existingTask) {
                taskUpdate.completionDate = new Date().toISOString();
            }
        } else {
            // Remove completion date when marking as incomplete
            if ('completedAt' in existingTask) {
                taskUpdate.completedAt = null;
            } else if ('completed_at' in existingTask) {
                taskUpdate.completed_at = null;
            } else if ('completionDate' in existingTask) {
                taskUpdate.completionDate = null;
            }
        }

        console.log('Using task update payload:', taskUpdate); // Debug log

        // Update local cache immediately for responsive UI
        // We use both field names in cache for compatibility
        localTaskCache.updateTask(taskId, {
            ...taskUpdate,
            status: isCompleted ? 'completed' : 'pending', // Always update status
            completed: isCompleted, // For local cache compatibility
            isCompleted: isCompleted // For local cache compatibility
        });
        
        // Then update Appwrite database with only the fields that exist in schema
        const response = await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            taskId,
            taskUpdate
        );
        
        console.log('Appwrite update success:', response); // Debug log
        
        // Ensure our local cache has the correct server state
        // But maintain the "completed" field for our UI which depends on it
        localTaskCache.updateTask(taskId, {
            ...response,
            completed: isCompleted, // Keep this for UI compatibility
            isCompleted: isCompleted // Keep this for UI compatibility
        });

        return {
            ...response,
            completed: isCompleted, // Return with completed field for UI compatibility
            isCompleted: isCompleted // Return with isCompleted field for UI compatibility  
        };
    } catch (error) {
        console.error('Appwrite service error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2)); // More detailed error
        // Return local cache version to keep UI consistent even if server update fails
        return localTaskCache.getTask(taskId);
    }
};

// Get completed tasks for a user
export const getCompletedTasks = async (userId) => {
    try {
        // If local cache is recent, filter from it
        const cacheAge = localTaskCache.lastFetched ? 
            (new Date() - localTaskCache.lastFetched) / 1000 / 60 : 
            Infinity;
            
        if (localTaskCache.tasks.length > 0 && cacheAge < 5) {
            return localTaskCache.tasks.filter(task => task.completed === true);
        }
        
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
                Query.equal('userId', userId),
                Query.equal('completed', true)
            ]
        );
        
        // Update our cache with these completed tasks
        const updatedTasks = [...localTaskCache.tasks];
        
        // Remove existing completed tasks and add new ones
        const currentCompletedIds = updatedTasks
            .filter(t => t.completed)
            .map(t => t.$id);
            
        const filteredTasks = updatedTasks.filter(t => !currentCompletedIds.includes(t.$id));
        const mergedTasks = [...filteredTasks, ...response.documents];
        
        localTaskCache.setTasks(mergedTasks);
        
        return response.documents;
    } catch (error) {
        console.error('Appwrite service error:', error);
        // If network fails, return filtered cached data
        return localTaskCache.tasks.filter(task => task.completed === true);
    }
};

// Get active/incomplete tasks for a user
export const getActiveTasks = async (userId) => {
    try {
        // If local cache is recent, filter from it
        const cacheAge = localTaskCache.lastFetched ? 
            (new Date() - localTaskCache.lastFetched) / 1000 / 60 : 
            Infinity;
            
        if (localTaskCache.tasks.length > 0 && cacheAge < 5) {
            return localTaskCache.tasks.filter(task => task.completed === false);
        }
        
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
                Query.equal('userId', userId),
                Query.equal('completed', false)
            ]
        );
        
        // Update our cache with these active tasks
        const updatedTasks = [...localTaskCache.tasks];
        
        // Remove existing active tasks and add new ones
        const currentActiveIds = updatedTasks
            .filter(t => !t.completed)
            .map(t => t.$id);
            
        const filteredTasks = updatedTasks.filter(t => !currentActiveIds.includes(t.$id));
        const mergedTasks = [...filteredTasks, ...response.documents];
        
        localTaskCache.setTasks(mergedTasks);
        
        return response.documents;
    } catch (error) {
        console.error('Appwrite service error:', error);
        // If network fails, return filtered cached data
        return localTaskCache.tasks.filter(task => task.completed === false);
    }
};

export const deleteTask = async (taskId) => {
    try {
        // Remove from local cache immediately
        localTaskCache.removeTask(taskId);
        
        // Then delete from Appwrite
        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTION_ID,
            taskId
        );
        
        return true;
    } catch (error) {
        console.error('Appwrite service error:', error);
        // Task is already removed from local cache, so the UI stays consistent
        return true;
    }
};

// Force refresh the local cache from the server
export const refreshTaskCache = async (userId) => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Query.equal('userId', userId)]
        );
        
        localTaskCache.setTasks(response.documents);
        return response.documents;
    } catch (error) {
        console.error('Error refreshing task cache:', error);
        return localTaskCache.tasks;
    }
};

// Export the cache for direct access if needed
export const taskCache = localTaskCache;

// Add this new function
export const updateUserName = async (userId, name) => {
  try {
    const updatedUser = await account.updateName(name);
    return updatedUser;
  } catch (error) {
    console.error('Error updating user name:', error);
    throw error;
  }
};
