import React, { useState, useEffect } from "react";
import TaskList from "../components/tasks/TaskList";
import TaskFormModal from "../components/tasks/TaskFormModal";
import { createPortal } from "react-dom";
import { getUserTasks, createTask, updateTask, deleteTask, toggleTaskCompletion, getCompletedTasks, getActiveTasks, taskCache } from '../utils/database';
import { 
  FaTasks, FaPlus, FaCheck, FaRegClock, 
  FaCalendarDay, FaCalendarPlus, FaRegCalendarCheck,
  FaUmbrellaBeach, FaHistory
} from "react-icons/fa";

const Tasks = () => {
  const [filter, setFilter] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks from Appwrite database with efficient filtering and caching
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        if (user) {
          // First check cache for immediate display
          if (taskCache.tasks.length > 0) {
            let filteredTasks;
            
            // Apply filter to cached tasks
            if (filter === 'completed') {
              filteredTasks = taskCache.tasks.filter(t => t.completed === true);
              setTasks(filteredTasks);
            } else if (filter === 'active') {
              filteredTasks = taskCache.tasks.filter(t => t.completed === false);
              setTasks(filteredTasks);
            } else {
              setTasks(taskCache.tasks);
            }
          }
          
          // Then fetch fresh data from server
          let fetchedTasks;
          if (filter === 'completed') {
            fetchedTasks = await getCompletedTasks(user.$id);
          } else if (filter === 'active') {
            fetchedTasks = await getActiveTasks(user.$id);
          } else {
            fetchedTasks = await getUserTasks(user.$id);
          }
          setTasks(fetchedTasks);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [filter]); // Re-fetch when filter changes

  // Handle task operations
  const handleAddTask = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      
      if (taskToEdit) {
        const { $id, $databaseId, $collectionId, ...cleanedData } = taskData;
        const updatedTask = await updateTask(taskToEdit.$id, cleanedData);
        
        if (updatedTask) {
          setTasks(prevTasks => {
            // Remove old version and add updated version
            const filteredTasks = prevTasks.filter(t => t.$id !== updatedTask.$id);
            return [...filteredTasks, updatedTask];
          });
        }
      } else {
        // Remove system fields from new task data
        const { $id, $databaseId, $collectionId, ...cleanedData } = taskData;
        
        // Create task on server first
        const newTask = await createTask(cleanedData, user.$id);
        
        if (newTask) {
          // Ensure no duplicates when adding to state
          setTasks(prevTasks => {
            // Filter out any potential duplicates first
            const uniqueTasks = prevTasks.filter(t => t.$id !== newTask.$id);
            return [...uniqueTasks, newTask];
          });
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving task:', error);
      setIsModalOpen(false);
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

  const handleDeleteTask = async (task) => {
    if (!task || !task.$id) {
      console.error('Invalid task object:', task);
      return;
    }
    
    try {
      const result = await deleteTask(task.$id);
      if (result) {
        // Only update state if delete was successful
        setTasks(prevTasks => prevTasks.filter(t => t.$id !== task.$id));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Enhanced toggle with local state management
  const handleToggleComplete = async (task) => {
    if (!task || !task.$id) {
      console.error('Invalid task object:', task);
      return;
    }
    
    try {
      // Update UI immediately for better user experience
      setTasks(prevTasks => prevTasks.map(t => 
        t.$id === task.$id ? {...t, completed: !task.completed} : t
      ));
      
      // Use the specialized toggle function
      const updatedTask = await toggleTaskCompletion(task.$id, !task.completed);
      
      // If task should no longer appear in the current filter view, remove it
      if ((filter === 'completed' && !updatedTask.completed) || 
          (filter === 'active' && updatedTask.completed)) {
        setTasks(prevTasks => prevTasks.filter(t => t.$id !== task.$id));
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      // Revert UI change using cache
      const cachedTask = taskCache.getTask(task.$id);
      if (cachedTask) {
        // If the task belongs in the current filter view, show it
        if ((filter === 'completed' && cachedTask.completed) || 
            (filter === 'active' && !cachedTask.completed) ||
            filter === 'all') {
          setTasks(prevTasks => prevTasks.map(t => 
            t.$id === task.$id ? cachedTask : t
          ));
        } else {
          // Otherwise remove it from the view
          setTasks(prevTasks => prevTasks.filter(t => t.$id !== task.$id));
        }
      }
    }
  };

  if (isLoading) {
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

  // Use more specialized filter logic in the JSX
  const filteredTasks = filter === 'all' ? 
    tasks : 
    filter === 'completed' ? 
      tasks.filter(t => t.completed) :
      filter === 'active' ? 
        tasks.filter(t => !t.completed) :
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
      {/* Header section - Updated with orange theme and better icons */}
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
            className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 
              transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>Add Task</span>
            <FaPlus />
          </button>
        </div>
        
        {/* Filter tabs - Updated with icons */}
        <div className="mt-4 sm:mt-6">
          {/* Status filters */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <FaCheck className="text-orange-400/70" /> 
              Status:
            </span>
            <FilterButton current={filter} value="all" onClick={setFilter}>
              All ({tasks.length})
            </FilterButton>
            <FilterButton current={filter} value="active" onClick={setFilter}>
              Active ({tasks.filter(t => !t.completed).length})
            </FilterButton>
            <FilterButton current={filter} value="completed" onClick={setFilter}>
              Completed ({tasks.filter(t => t.completed).length})
            </FilterButton>
          </div>
          
          {/* Date filters with icons */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto py-1 -mx-1 px-1">
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <FaCalendarDay className="text-orange-400/70" />
              Date:
            </span>
            <FilterButton current={filter} value="today" onClick={setFilter} special IconComponent={FaCalendarDay}>
              Today ({tasks.filter(t => isDateEqual(t.deadline, today)).length})
            </FilterButton>
            <FilterButton current={filter} value="tomorrow" onClick={setFilter} IconComponent={FaCalendarPlus}>
              Tomorrow ({tasks.filter(t => isDateEqual(t.deadline, tomorrow)).length})
            </FilterButton>
            <FilterButton current={filter} value="weekend" onClick={setFilter} IconComponent={FaUmbrellaBeach}>
              Weekend ({tasks.filter(t => isWeekend(t.deadline)).length})
            </FilterButton>
            <FilterButton current={filter} value="yesterday" onClick={setFilter} IconComponent={FaHistory}>
              Yesterday ({tasks.filter(t => isDateEqual(t.deadline, yesterday)).length})
            </FilterButton>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {/* If today, tomorrow, or weekend is selected, show relevant sections */}
        {filter === 'all' && (
          <TaskSections tasks={tasks} today={today} tomorrow={tomorrow} 
            weekend={[weekendStart, weekendEnd]} isDateEqual={isDateEqual} isWeekend={isWeekend} 
            handleEditTask={handleEditTask} handleDeleteTask={handleDeleteTask}
            handleToggleComplete={handleToggleComplete} />
        )}
        
        {/* For filtered views - Updated with orange theme */}
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
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Use React portal to render modals outside of parent containers */}
      {isModalOpen && createPortal(
        <TaskFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSaveTask} 
          taskToEdit={taskToEdit} 
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

// New component for empty state - Updated with orange theme border
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

// New component to display section icon
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

// Updated TaskSections component with orange theme
const TaskSections = ({ tasks, today, tomorrow, weekend, isDateEqual, isWeekend, handleEditTask, handleDeleteTask, handleToggleComplete }) => {
  const todayTasks = tasks.filter(t => isDateEqual(t.deadline, today) && !t.completed);
  const tomorrowTasks = tasks.filter(t => isDateEqual(t.deadline, tomorrow) && !t.completed);
  const weekendTasks = tasks.filter(t => isWeekend(t.deadline) && !t.completed);
  const otherActiveTasks = tasks.filter(t => 
    !isDateEqual(t.deadline, today) && 
    !isDateEqual(t.deadline, tomorrow) && 
    !isWeekend(t.deadline) && 
    !t.completed
  );
  const completedTasks = tasks.filter(t => t.completed);

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
          completed
          collapsible
        />
      )}
    </div>
  );
};

// Updated TaskSection component with orange theme
const TaskSection = ({ title, tasks, icon, accentColor = "orange", onEdit, onDelete, onToggleComplete, completed = false, collapsible = false }) => {
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
          />
        </div>
      </div>
    </div>
  );
};

export default Tasks;