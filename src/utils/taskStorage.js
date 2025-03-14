// Import uuid - if this causes an error, you may need to install it using:
// npm install uuid
import { v4 as uuidv4 } from 'uuid';

const TASKS_KEY = 'effisense_tasks';

// Get tasks from localStorage
export const getTasks = () => {
  const tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
  
  // Generate instances for recurring tasks
  const expandedTasks = [...tasks];
  
  // Find and expand recurring tasks
  tasks.forEach(task => {
    if (task.isRecurring && task.recurringType) {
      const instances = generateRecurringInstances(task);
      expandedTasks.push(...instances);
    }
  });
  
  return expandedTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
};

// Generate instances for recurring tasks
const generateRecurringInstances = (task) => {
  const instances = [];
  
  if (!task.isRecurring || !task.deadline) {
    return instances;
  }
  
  const startDate = new Date(task.deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // For performance, limit how far into the future we generate instances
  const futureLimit = new Date();
  futureLimit.setDate(today.getDate() + 60); // Generate 60 days into the future
  
  let currentDate = new Date(startDate);
  
  // Generate up to 10 instances or until we hit the future limit
  for (let i = 0; i < 10 && currentDate < futureLimit; i++) {
    // Skip the original task instance
    if (i === 0) {
      currentDate = getNextDate(currentDate, task.recurringType);
      continue;
    }
    
    // Create a new instance
    const instance = {
      ...task,
      id: `${task.id}-instance-${i}`,
      parentTaskId: task.id,
      isRecurringInstance: true,
      deadline: currentDate.toISOString(),
      status: 'pending', // Reset status for future instances
      completed: false, // Reset completion status
    };
    
    instances.push(instance);
    
    // Get next date based on recurrence pattern
    currentDate = getNextDate(currentDate, task.recurringType);
  }
  
  return instances;
};

// Calculate next date based on recurrence type
const getNextDate = (date, recurringType) => {
  const nextDate = new Date(date);
  
  switch (recurringType) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    default:
      nextDate.setDate(nextDate.getDate() + 1);
  }
  
  return nextDate;
};

// Add a task
export const addTask = (taskData) => {
  const tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
  
  const newTask = {
    ...taskData,
    id: uuidv4(), // Generate unique ID
    createdAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  
  // Return expanded tasks including recurring instances
  return getTasks();
};

// Update a task
export const updateTask = (taskId, updatedData) => {
  const tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex !== -1) {
    // Handle recurring instance updates
    if (tasks[taskIndex].isRecurringInstance || updatedData.isRecurringInstance) {
      const instanceId = taskId;
      const parentId = tasks[taskIndex].parentTaskId || updatedData.parentTaskId;
      
      // If completing a recurring instance
      if (updatedData.completed) {
        // Store completed instance separately
        const completedInstance = {
          ...tasks[taskIndex],
          ...updatedData,
          id: instanceId,
          parentTaskId: parentId
        };
        
        // Add completed instance to tasks array or update existing
        const existingInstanceIndex = tasks.findIndex(t => t.id === instanceId);
        if (existingInstanceIndex !== -1) {
          tasks[existingInstanceIndex] = completedInstance;
        } else {
          tasks.push(completedInstance);
        }
      } 
      // If un-completing, just update the status
      else if (updatedData.hasOwnProperty('completed') && !updatedData.completed) {
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          ...updatedData
        };
      }
    } 
    // Regular task update
    else {
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...updatedData,
        updatedAt: new Date().toISOString() // Always update the timestamp
      };
    }
    
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }
  
  return tasks[taskIndex] || null; // Return the updated task or null if not found
};

// Delete a task
export const deleteTask = (taskId) => {
  const tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
  const filteredTasks = tasks.filter(task => task.id !== taskId);
  
  localStorage.setItem(TASKS_KEY, JSON.stringify(filteredTasks));
  
  return getTasks();
};

// Reschedule a task instance
export const rescheduleTaskInstance = (instanceId, newDate) => {
  const tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
  
  // Extract the parent ID from the instance ID
  const [parentId] = instanceId.split('-instance-');
  
  // Create a new task based on the parent, with the new date
  const parentTask = tasks.find(task => task.id === parentId);
  
  if (!parentTask) return getTasks();
  
  const rescheduledTask = {
    ...parentTask,
    id: uuidv4(),
    deadline: newDate.toISOString(),
    isRescheduled: true,
    originalDate: parentTask.deadline,
    status: 'pending',
    completed: false
  };
  
  tasks.push(rescheduledTask);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  
  return getTasks();
};
