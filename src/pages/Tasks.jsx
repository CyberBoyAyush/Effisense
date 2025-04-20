import React, { useState, useEffect, useCallback } from "react";
import TaskList from "../components/tasks/TaskList";
import TaskFormModal from "../components/tasks/TaskFormModal";
import { createPortal } from "react-dom";
import { getUserTasks, createTask, updateTask, deleteTask, toggleTaskCompletion, getCompletedTasks, getActiveTasks } from '../utils/database';
import { createGoogleCalendarEvent, updateGoogleCalendarEvent, checkSignedInStatus } from '../utils/googleCalendar';
import { 
  FaTasks, FaPlus, FaCheck, FaRegClock, 
  FaCalendarDay, FaCalendarPlus, FaRegCalendarCheck,
  FaUmbrellaBeach, FaHistory
} from "react-icons/fa";
import { useToast } from '../contexts/ToastContext';

const Tasks = () => {
  const { addToast } = useToast();
  const [filter, setFilter] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]); // New state to store all tasks regardless of filter
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState({
    saving: false,
    deleting: false,
    toggling: null, // Will store the task ID being toggled
  });
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  // Check Google Calendar connection status
  useEffect(() => {
    const checkGoogleStatus = async () => {
      const isConnected = await checkSignedInStatus();
      setIsGoogleConnected(isConnected);
    };
    
    checkGoogleStatus();
  }, []);

  // Define fetchTasks as a useCallback function so it can be used in other functions
  const fetchTasks = useCallback(async () => {
    try {
      // Only show loading on initial data fetch
      if (tasks.length === 0) {
        setIsInitialLoading(true);
      }
      
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      
      if (user) {
        // Always fetch all tasks for accurate counts
        const fetchedAllTasks = await getUserTasks(user.$id);
        setAllTasks(fetchedAllTasks);
        
        // Apply filter to determine which tasks to display
        let filteredTasks;
        if (filter === 'completed') {
          filteredTasks = await getCompletedTasks(user.$id);
        } else if (filter === 'active') {
          filteredTasks = await getActiveTasks(user.$id);
        } else if (filter === 'all') {
          filteredTasks = fetchedAllTasks;
        } else {
          // For date-based filters, filter the all tasks locally
          filteredTasks = fetchedAllTasks.filter(task => shouldShowTaskInCurrentFilter(task, filter));
        }
        setTasks(filteredTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      addToast('Error fetching tasks', 'error');
    } finally {
      setIsInitialLoading(false);
    }
  }, [filter, addToast]);

  // Load tasks from Appwrite database with efficient filtering and caching
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]); // Re-fetch when filter changes

  // Handle task operations
  const handleAddTask = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  // Updated handleSaveTask function with optimized state management
  const handleSaveTask = async (taskData) => {
    try {
      setOperationLoading(prev => ({ ...prev, saving: true }));
      
      // Get current user from localStorage
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      
      // Create or update task
      let savedTask;
      if (taskData.$id) {
        // Update existing task
        savedTask = await updateTask(taskData.$id, taskData);
        console.log("Task updated successfully:", savedTask);
        
        // Update both task states
        setTasks(prevTasks => prevTasks.map(task => 
          task.$id === savedTask.$id ? savedTask : task
        ));
        setAllTasks(prevAllTasks => prevAllTasks.map(task => 
          task.$id === savedTask.$id ? savedTask : task
        ));
      } else {
        // Create new task
        savedTask = await createTask(taskData, user.$id);
        console.log("Task created successfully:", savedTask);
        
        // Always update allTasks
        setAllTasks(prevAllTasks => [...prevAllTasks, savedTask]);
        
        // Only update visible tasks if it should be shown in current filter
        if (shouldShowTaskInCurrentFilter(savedTask, filter)) {
          setTasks(prevTasks => [...prevTasks, savedTask]);
        }
      }
      
      // Handle Google Calendar sync if enabled
      if (taskData.syncWithGoogle && isGoogleConnected && savedTask) {
        try {
          console.log("Attempting to sync with Google Calendar");
          if (taskData.$id) {
            // Update existing Google Calendar event
            await updateGoogleCalendarEvent({...savedTask});
            console.log("Google Calendar event updated successfully");
          } else {
            // Create new Google Calendar event
            await createGoogleCalendarEvent({...savedTask});
            console.log("Google Calendar event created successfully");
          }
        } catch (gcalError) {
          console.error("Google Calendar sync error:", gcalError);
          addToast('Task saved but failed to sync with Google Calendar', 'warning');
        }
      }
      
      // Show success toast
      addToast('Task saved successfully!', 'success');
      return savedTask;
      
    } catch (error) {
      console.error('Error saving task:', error);
      addToast('Error saving task. Please try again.', 'error');
      throw error;
    } finally {
      setOperationLoading(prev => ({ ...prev, saving: false }));
    }
  };

  // Helper function to determine if a task should be shown in the current filter
  const shouldShowTaskInCurrentFilter = (task, currentFilter) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Calculate weekend dates
    const getWeekendDates = () => {
      const saturday = new Date(today);
      const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
      saturday.setDate(today.getDate() + daysUntilSaturday);
      
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      
      return [saturday, sunday];
    };
    
    const [weekendStart, weekendEnd] = getWeekendDates();
    
    const isDateEqual = (dateStr, targetDate) => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return date.getDate() === targetDate.getDate() && 
             date.getMonth() === targetDate.getMonth() && 
             date.getFullYear() === targetDate.getFullYear();
    };
    
    const isWeekend = (dateStr) => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return isDateEqual(dateStr, weekendStart) || isDateEqual(dateStr, weekendEnd);
    };

    switch (currentFilter) {
      case 'all': 
        return true;
      case 'completed': 
        return task.status === 'completed';
      case 'active': 
        return task.status !== 'completed';
      case 'today': 
        return isDateEqual(task.deadline, today);
      case 'tomorrow': 
        return isDateEqual(task.deadline, tomorrow);
      case 'weekend': 
        return isWeekend(task.deadline);
      default: 
        return true;
    }
  };

  const handleEditTask = (task) => {
    if (!task || !task.$id) {
      console.error('Invalid task object:', task);
      return;
    }
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  // Optimized delete with immediate UI update
  const handleDeleteTask = async (taskToDelete) => {
    try {
      // Check if we have a task object or just an ID
      const taskId = typeof taskToDelete === 'object' && taskToDelete !== null ? 
        taskToDelete.$id : taskToDelete;
      
      if (!taskId || typeof taskId !== 'string') {
        console.error('Invalid task ID:', taskId);
        addToast('Cannot delete task: Invalid task ID', 'error');
        return;
      }
      
      // Immediately update both UI states optimistically
      setTasks(prevTasks => prevTasks.filter(task => task.$id !== taskId));
      setAllTasks(prevAllTasks => prevAllTasks.filter(task => task.$id !== taskId));
      
      // Update loading state for specific task
      setOperationLoading(prev => ({ ...prev, deleting: taskId }));
      
      // Clean the task ID to ensure it meets Appwrite's requirements
      const validTaskId = taskId.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 36);
      console.log('Deleting task with cleaned ID:', validTaskId);
      
      await deleteTask(validTaskId);
      addToast('Task deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting task:', error);
      addToast('Failed to delete task. Please try again.', 'error');
      // Restore the task in case of error - fetch all tasks again
      fetchTasks();
    } finally {
      setOperationLoading(prev => ({ ...prev, deleting: null }));
    }
  };

  // Enhanced toggle with optimistic update
  const handleToggleComplete = async (task) => {
    try {
      if (!task || !task.$id) {
        console.error('Invalid task object:', task);
        return;
      }
      
      // Calculate the new status
      const isCurrentlyCompleted = task.status === 'completed';
      const newStatus = isCurrentlyCompleted ? 'pending' : 'completed';
      
      // Set loading state for this specific task
      setOperationLoading(prev => ({ ...prev, toggling: task.$id }));
      
      // Optimistically update the UI
      const updatedTask = { ...task, status: newStatus };
      
      // Update allTasks always
      setAllTasks(prevAllTasks => prevAllTasks.map(t => 
        t.$id === task.$id ? updatedTask : t
      ));
      
      // Check if task should be removed from current view based on filter
      const shouldRemoveFromView = !shouldShowTaskInCurrentFilter(updatedTask, filter);
      
      if (shouldRemoveFromView) {
        // Remove task from view immediately
        setTasks(prevTasks => prevTasks.filter(t => t.$id !== task.$id));
      } else {
        // Update task status in the current view
        setTasks(prevTasks => prevTasks.map(t => 
          t.$id === task.$id ? updatedTask : t
        ));
      }
      
      // Update backend
      await toggleTaskCompletion(task.$id, !isCurrentlyCompleted);
      addToast(
        isCurrentlyCompleted ? 'Task marked as incomplete!' : 'Task marked as complete!', 
        'success'
      );
    } catch (error) {
      console.error('Error toggling task completion:', error);
      addToast('Failed to update task status. Please try again.', 'error');
      // Restore original state by fetching all tasks
      fetchTasks();
    } finally {
      setOperationLoading(prev => ({ ...prev, toggling: null }));
    }
  };

  if (isInitialLoading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[200px]">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Get date objects for filters
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Calculate weekend dates (next Saturday and Sunday)
  const getWeekendDates = () => {
    const saturday = new Date(today);
    const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
    saturday.setDate(today.getDate() + daysUntilSaturday);
    
    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);
    
    return [saturday, sunday];
  };
  
  const [weekendStart, weekendEnd] = getWeekendDates();
  
  // Filter functions for date-based filtering
  const isDateEqual = (dateStr, targetDate) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date.getDate() === targetDate.getDate() && 
           date.getMonth() === targetDate.getMonth() && 
           date.getFullYear() === targetDate.getFullYear();
  };
  
  const isWeekend = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return isDateEqual(dateStr, weekendStart) || isDateEqual(dateStr, weekendEnd);
  };

  // Use status field for filtering tasks
  const filteredTasks = filter === 'all' ? 
    tasks : 
    filter === 'completed' ? 
      tasks.filter(t => t.status === 'completed') :
      filter === 'active' ? 
        tasks.filter(t => t.status !== 'completed') : // Include both pending and in_progress
        filter === 'today' ? 
          tasks.filter(t => isDateEqual(t.deadline, today)) :
          filter === 'tomorrow' ? 
            tasks.filter(t => isDateEqual(t.deadline, tomorrow)) :
            filter === 'weekend' ? 
              tasks.filter(t => isWeekend(t.deadline)) :
              filter === 'yesterday' ? 
                tasks.filter(t => isDateEqual(t.deadline, yesterday)) :
                tasks;

  return (
    <div className="p-2 sm:p-4 md:p-6 text-gray-200">
      {/* Header section */}
      <div className="bg-gradient-to-r from-gray-800/50 to-orange-900/30 p-4 sm:p-6 md:p-8 rounded-2xl backdrop-blur-sm border border-orange-800/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent flex items-center gap-3">
              <FaTasks className="text-orange-400" />
              <span>Task Management</span>
            </h1>
            <p className="text-sm md:text-base text-gray-400 mt-1 md:mt-2 flex items-center gap-2">
              <FaRegClock className="text-orange-400/70" />
              <span>Organize and track your tasks efficiently</span>
            </p>
          </div>
          <button
            onClick={handleAddTask}
            disabled={operationLoading.saving}
            className={`w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 
              transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2
              ${operationLoading.saving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {operationLoading.saving ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></span>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Add Task</span>
                <FaPlus />
              </>
            )}
          </button>
        </div>
        
        {/* Filter tabs - Updated to use allTasks for counts */}
        <div className="mt-4 sm:mt-6">
          {/* Status filters */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <FaCheck className="text-orange-400/70" /> 
              Status:
            </span>
            <FilterButton current={filter} value="all" onClick={setFilter}>
              All ({allTasks.length})
            </FilterButton>
            <FilterButton current={filter} value="active" onClick={setFilter}>
              Active ({allTasks.filter(t => t.status !== 'completed').length})
            </FilterButton>
            <FilterButton current={filter} value="completed" onClick={setFilter}>
              Completed ({allTasks.filter(t => t.status === 'completed').length})
            </FilterButton>
          </div>
          
          {/* Date filters with icons - Updated to use allTasks for counts */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto py-1 -mx-1 px-1">
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <FaCalendarDay className="text-orange-400/70" />
              Date:
            </span>
            <FilterButton current={filter} value="today" onClick={setFilter} special IconComponent={FaCalendarDay}>
              Today ({allTasks.filter(t => isDateEqual(t.deadline, today)).length})
            </FilterButton>
            <FilterButton current={filter} value="tomorrow" onClick={setFilter} IconComponent={FaCalendarPlus}>
              Tomorrow ({allTasks.filter(t => isDateEqual(t.deadline, tomorrow)).length})
            </FilterButton>
            <FilterButton current={filter} value="weekend" onClick={setFilter} IconComponent={FaUmbrellaBeach}>
              Weekend ({allTasks.filter(t => isWeekend(t.deadline)).length})
            </FilterButton>
            <FilterButton current={filter} value="yesterday" onClick={setFilter} IconComponent={FaHistory}>
              Yesterday ({allTasks.filter(t => isDateEqual(t.deadline, yesterday)).length})
            </FilterButton>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {/* If today, tomorrow, or weekend is selected, show relevant sections */}
        {filter === 'all' && (
          <TaskSections 
            tasks={tasks} 
            today={today} 
            tomorrow={tomorrow} 
            weekend={[weekendStart, weekendEnd]} 
            isDateEqual={isDateEqual} 
            isWeekend={isWeekend} 
            handleEditTask={handleEditTask} 
            handleDeleteTask={handleDeleteTask}
            handleToggleComplete={handleToggleComplete}
            operationLoading={operationLoading}
          />
        )}
        
        {/* For filtered views */}
        {filter !== 'all' && (
          <>
            {filteredTasks.length === 0 ? (
              <EmptyTasksMessage filter={filter} />
            ) : (
              <div className="bg-gray-800/30 backdrop-blur-sm border border-orange-800/30 rounded-xl p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <TasksIcon filter={filter} />
                  <span>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)} Tasks ({filteredTasks.length})
                  </span>
                </h2>
                <TaskList 
                  tasks={filteredTasks} 
                  onEdit={handleEditTask} 
                  onDelete={handleDeleteTask}
                  onToggleComplete={handleToggleComplete}
                  operationLoading={operationLoading}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Task form modal */}
      {isModalOpen && createPortal(
        <TaskFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSaveTask} 
          taskToEdit={taskToEdit}
          isLoading={operationLoading.saving}
        />,
        document.body
      )}
    </div>
  );
};

// Updated FilterButton component with icon support
const FilterButton = ({ current, value, onClick, children, special, IconComponent }) => (
  <button
    onClick={() => onClick(value)}
    className={`px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap text-sm transition-all duration-200 
      flex items-center gap-2
      ${current === value
        ? 'bg-orange-600 text-white'
        : special 
          ? 'bg-orange-600/20 border border-orange-500/30 text-orange-300 hover:bg-orange-600/30' 
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
      }`}
  >
    {IconComponent && <IconComponent className={current === value ? 'text-white' : 'text-orange-400'} />}
    {children}
  </button>
);

// EmptyTasksMessage component
const EmptyTasksMessage = ({ filter }) => {
  let message, emoji;
  
  switch(filter) {
    case 'today':
      emoji = '📅';
      message = 'No tasks scheduled for today';
      break;
    case 'tomorrow':
      emoji = '🔮';
      message = 'No tasks planned for tomorrow';
      break;
    case 'weekend':
      emoji = '🏝️';
      message = 'Your weekend looks clear';
      break;
    case 'active':
      emoji = '✓';
      message = 'No active tasks';
      break;
    case 'completed':
      emoji = '🎉';
      message = 'No completed tasks';
      break;
    default:
      emoji = '📝';
      message = 'No tasks found';
  }
  
  return (
    <div className="text-center py-12 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-orange-800/30">
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className="text-xl font-semibold text-gray-300">{message}</h3>
      <p className="text-gray-400 mt-2">Tasks you add will appear here</p>
    </div>
  );
};

// TasksIcon component
const TasksIcon = ({ filter }) => {
  switch(filter) {
    case 'today': return <FaCalendarDay className="text-orange-400" />;
    case 'tomorrow': return <FaCalendarPlus className="text-orange-400" />;
    case 'weekend': return <FaUmbrellaBeach className="text-orange-400" />;
    case 'completed': return <FaCheck className="text-orange-400" />;
    case 'active': return <FaRegClock className="text-orange-400" />;
    default: return <FaTasks className="text-orange-400" />;
  }
};

// Updated TaskSections component with loading state
const TaskSections = ({ tasks, today, tomorrow, weekend, isDateEqual, isWeekend, handleEditTask, handleDeleteTask, handleToggleComplete, operationLoading }) => {
  const todayTasks = tasks.filter(t => isDateEqual(t.deadline, today) && t.status !== 'completed');
  const tomorrowTasks = tasks.filter(t => isDateEqual(t.deadline, tomorrow) && t.status !== 'completed');
  const weekendTasks = tasks.filter(t => isWeekend(t.deadline) && t.status !== 'completed');
  const otherActiveTasks = tasks.filter(t => 
    !isDateEqual(t.deadline, today) && 
    !isDateEqual(t.deadline, tomorrow) && 
    !isWeekend(t.deadline) && 
    t.status !== 'completed'
  );
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-8">
      {/* Today's Tasks */}
      {todayTasks.length > 0 && (
        <TaskSection 
          title="Today" 
          tasks={todayTasks} 
          icon="📅" 
          accentColor="orange"
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
          operationLoading={operationLoading}
        />
      )}
      
      {/* Tomorrow's Tasks */}
      {tomorrowTasks.length > 0 && (
        <TaskSection 
          title="Tomorrow" 
          tasks={tomorrowTasks} 
          icon="🔮" 
          accentColor="amber"
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
          operationLoading={operationLoading}
        />
      )}
      
      {/* Weekend Tasks */}
      {weekendTasks.length > 0 && (
        <TaskSection 
          title="Weekend" 
          tasks={weekendTasks} 
          icon="🏝️" 
          accentColor="orange"
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
          operationLoading={operationLoading}
        />
      )}
      
      {/* Other Active Tasks */}
      {otherActiveTasks.length > 0 && (
        <TaskSection 
          title="Other Tasks" 
          tasks={otherActiveTasks} 
          icon="📌" 
          accentColor="gray"
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
          operationLoading={operationLoading}
        />
      )}
      
      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <TaskSection 
          title="Completed" 
          tasks={completedTasks} 
          icon="✅" 
          accentColor="green"
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
          operationLoading={operationLoading}
          completed
          collapsible
        />
      )}
    </div>
  );
};

// Updated TaskSection component to include loading state
const TaskSection = ({ title, tasks, icon, accentColor = "orange", onEdit, onDelete, onToggleComplete, operationLoading, completed = false, collapsible = false }) => {
  const [collapsed, setCollapsed] = useState(collapsible);
  
  // Set border and accent colors based on the provided color - Updated with orange
  const accentColorClass = {
    orange: 'border-orange-500/30',
    amber: 'border-amber-500/30',
    green: 'border-green-500/30',
    gray: 'border-gray-500/30'
  }[accentColor] || 'border-orange-700/50';
  
  return (
    <div className={`bg-gray-800/30 backdrop-blur-sm border ${accentColorClass} rounded-xl overflow-hidden`}>
      {/* Section Header */}
      <div className="p-4 sm:p-6 border-b border-gray-700/30 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h2 className="text-xl font-semibold text-white">{title} ({tasks.length})</h2>
        </div>
        
        {collapsible && (
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 text-gray-400 hover:text-orange-300 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <svg className={`w-5 h-5 transition-transform ${collapsed ? '' : 'transform rotate-180'}`} 
              viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Tasks List - Collapsible */}
      <div className={`${collapsed ? 'hidden' : 'block'}`}>
        <div className="p-4 sm:p-6">
          <TaskList 
            tasks={tasks} 
            onEdit={onEdit} 
            onDelete={onDelete}
            onToggleComplete={onToggleComplete}
            operationLoading={operationLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Tasks;