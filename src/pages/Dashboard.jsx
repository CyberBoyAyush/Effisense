import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import TaskList from "../components/tasks/TaskList";
import TaskFormModal from "../components/tasks/TaskFormModal";
import { getUserTasks, createTask, updateTask, deleteTask, toggleTaskCompletion, refreshTaskCache, taskCache } from '../utils/database';
import { 
  FaHandPaper, FaPlus, FaListUl, FaCalendarAlt, 
  FaClipboardList, FaCheckCircle, FaHourglassHalf,
  FaExclamationCircle, FaFilter, FaAngleDown,
  FaEye, FaEyeSlash, FaInbox, FaRegClock
} from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);

  useEffect(() => {
    // Load tasks when component mounts
    const fetchTasks = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        if (user) {
          // First get tasks from cache for immediate display
          const cachedTasks = taskCache.tasks;
          if (cachedTasks.length > 0) {
            setTasks(cachedTasks);
            setFilteredTasks(cachedTasks);
          }
          
          // Then fetch latest tasks from backend and update if needed
          const fetchedTasks = await getUserTasks(user.$id);
          setTasks(fetchedTasks);
          setFilteredTasks(fetchedTasks);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();

    // Check authentication
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
      navigate("/login");
    } else {
      setUser(loggedInUser);
    }
  }, [navigate]);

  // Apply priority filter when it changes or when tasks change
  useEffect(() => {
    if (priorityFilter === "all") {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(task => task.priority === priorityFilter));
    }
  }, [priorityFilter, tasks]);

  // Separate tasks into completed and queued
  const queuedTasks = filteredTasks.filter(task => !task.completed);
  const completedTasks = filteredTasks.filter(task => task.completed);

  // Add new task
  const handleAddTask = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  // Save or update a task with immediate UI update
  const handleSaveTask = async (taskData) => {
    try {
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      
      if (taskToEdit) {
        // Update existing task
        // First update UI optimistically
        const optimisticTask = {
          ...taskToEdit,
          ...taskData,
          updatedAt: new Date().toISOString()
        };
        
        setTasks(prevTasks => prevTasks.map(task => 
          task.$id === taskToEdit.$id ? optimisticTask : task
        ));
        
        // Then send to server
        const updatedTask = await updateTask(taskToEdit.$id, taskData);
        
        // Update with server response if needed
        if (updatedTask) {
          setTasks(prevTasks => prevTasks.map(task => 
            task.$id === updatedTask.$id ? updatedTask : task
          ));
        }
      } else {
        // Create new task with optimistic UI update
        const tempId = 'temp-' + Date.now();
        const optimisticTask = {
          ...taskData,
          $id: tempId,
          userId: user.$id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Add to UI immediately
        setTasks(prevTasks => [...prevTasks, optimisticTask]);
        
        // Send to server
        const newTask = await createTask(taskData, user.$id);
        
        // Replace temporary task with real one from server
        if (newTask) {
          setTasks(prevTasks => prevTasks.map(task => 
            task.$id === tempId ? newTask : task
          ));
        }
      }
      setIsModalOpen(false);
      setTaskToEdit(null);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  // Edit task
  const handleEditTask = (index, isCompleted = false) => {
    // Use the right array based on completed status
    const taskArray = isCompleted ? completedTasks : queuedTasks;
    const taskToEdit = taskArray[index];
    
    // Find original task index in the full tasks array
    const originalIndex = tasks.findIndex(t => t.$id === taskToEdit.$id);
    setTaskToEdit({ ...tasks[originalIndex], index: originalIndex });
    setIsModalOpen(true);
  };

  // Delete task
  const handleDeleteTask = async (index, isCompleted = false) => {
    try {
      const taskArray = isCompleted ? completedTasks : queuedTasks;
      const taskId = taskArray[index].$id;
      
      await deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.$id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Improved toggle with better state management
  const handleToggleComplete = async (task) => {
    try {
      if (!task || !task.$id) {
        console.error('Invalid task object:', task);
        return;
      }
      
      // Update UI immediately for better user experience
      setTasks(prevTasks => prevTasks.map(t => 
        t.$id === task.$id ? {...t, completed: !task.completed} : t
      ));
      
      // Update local filtered tasks as well
      setFilteredTasks(prevTasks => prevTasks.map(t => 
        t.$id === task.$id ? {...t, completed: !task.completed} : t
      ));
      
      // Use the specialized toggle function with the task cache
      const updatedTask = await toggleTaskCompletion(task.$id, !task.completed);
      
      // If update fails, the toggleTaskCompletion function will handle fallbacks internally
      if (!updatedTask) {
        console.error('Task update failed completely');
        // The taskCache will still have the correct state, so refresh from there
        const cachedTask = taskCache.getTask(task.$id);
        if (cachedTask) {
          setTasks(prevTasks => prevTasks.map(t => 
            t.$id === task.$id ? cachedTask : t
          ));
          setFilteredTasks(prevTasks => prevTasks.map(t => 
            t.$id === task.$id ? cachedTask : t
          ));
        }
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      // Revert UI change if there's an error, using the cached version
      const cachedTask = taskCache.getTask(task.$id);
      if (cachedTask) {
        setTasks(prevTasks => prevTasks.map(t => 
          t.$id === task.$id ? cachedTask : t
        ));
        setFilteredTasks(prevTasks => prevTasks.map(t => 
          t.$id === task.$id ? cachedTask : t
        ));
      }
    }
  };

  // Priority filter counts
  const priorityCounts = {
    high: tasks.filter(t => t.priority === "high").length,
    medium: tasks.filter(t => t.priority === "medium").length,
    low: tasks.filter(t => t.priority === "low").length,
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 text-gray-200">
      {/* Welcome Section - Updated with orange theme */}
      <div className="bg-gradient-to-r from-gray-800/50 to-orange-900/20 p-3 sm:p-4 md:p-8 rounded-2xl backdrop-blur-sm border border-orange-700/30">
        <div className="max-w-4xl">
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent flex items-center gap-3">
            <FaHandPaper className="text-orange-400" />
            <span>Welcome back, {user?.name}!</span>
          </h1>
          <p className="text-sm md:text-lg text-gray-400 mt-2 flex items-center gap-2">
            <FaHourglassHalf className="text-orange-400/70" />
            <span>Let's make your day more productive.</span>
          </p>
        </div>
      </div>

      {/* Statistics Cards - Updated with better icons and more compact for mobile */}
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-3 md:gap-6 mt-3 sm:mt-6 md:mt-8">
        <StatCard title="Total Tasks" value={tasks.length} Icon={FaClipboardList} color="orange" />
        <StatCard title="Completed" value={tasks.filter(t => t.completed).length} Icon={FaCheckCircle} color="amber" />
        <StatCard title="Pending" value={tasks.filter(t => !t.completed).length} Icon={FaHourglassHalf} color="orange" />
      </div>

      {/* Tasks Section - Updated with icons */}
      <div className="mt-4 sm:mt-6 md:mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-white flex items-center gap-2">
            <FaListUl className="text-orange-400" />
            <span>Your Tasks</span>
          </h2>
          
          {/* Add Task Button */}
          <button 
            onClick={handleAddTask}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg 
              hover:from-orange-500 hover:to-amber-500 transform hover:scale-105 transition-all duration-200 
              shadow-[0_0_15px_rgba(251,146,60,0.3)] hover:shadow-[0_0_20px_rgba(251,146,60,0.4)]
              flex items-center justify-center sm:justify-start gap-2"
          >
            <span>Add Task</span>
            <FaPlus />
          </button>
        </div>
        
        {/* Priority Filter Tabs - Replace dropdown with tab buttons */}
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-400 mr-1 flex items-center">
            <FaFilter className="text-orange-400 mr-1" />
            Filter:
          </span>
          <PriorityTab 
            active={priorityFilter === 'all'} 
            onClick={() => setPriorityFilter('all')}
            count={tasks.length}
          >
            All
          </PriorityTab>
          <PriorityTab 
            active={priorityFilter === 'high'} 
            onClick={() => setPriorityFilter('high')}
            count={priorityCounts.high}
            color="red"
          >
            High
          </PriorityTab>
          <PriorityTab 
            active={priorityFilter === 'medium'} 
            onClick={() => setPriorityFilter('medium')}
            count={priorityCounts.medium}
            color="amber"
          >
            Medium
          </PriorityTab>
          <PriorityTab 
            active={priorityFilter === 'low'} 
            onClick={() => setPriorityFilter('low')}
            count={priorityCounts.low}
            color="green"
          >
            Low
          </PriorityTab>
        </div>
        
        {/* Conditional message for filtered results */}
        {priorityFilter !== "all" && (
          <div className="flex items-center gap-2 mb-4 py-2 px-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <FaExclamationCircle className={`
              ${priorityFilter === "high" ? "text-red-400" : 
                priorityFilter === "medium" ? "text-amber-400" : "text-green-400"}
            `} />
            <span className="text-sm text-gray-300">
              Showing {filteredTasks.length} {priorityFilter} priority task{filteredTasks.length !== 1 ? 's' : ''}
            </span>
            <button 
              className="ml-auto text-xs text-orange-400 hover:text-orange-300"
              onClick={() => setPriorityFilter("all")}
            >
              Show All
            </button>
          </div>
        )}

        {/* Queued Tasks Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaInbox className="text-orange-400" />
              <h3 className="text-lg font-medium text-white">Queued Tasks</h3>
              <span className="bg-orange-500/20 text-orange-300 text-xs px-2 py-1 rounded-md">
                {queuedTasks.length}
              </span>
            </div>
          </div>
          
          {queuedTasks.length === 0 ? (
            <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 text-center text-gray-400">
              <p>No queued tasks. Great job!</p>
            </div>
          ) : (
            <TaskList 
              tasks={queuedTasks} 
              onEdit={(task) => handleEditTask(queuedTasks.findIndex(t => t.$id === task.$id), false)}
              onDelete={(taskId) => handleDeleteTask(taskId)} 
              onToggleComplete={handleToggleComplete} 
            />
          )}
        </div>
        
        {/* Completed Tasks Section with Toggle */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-400" />
              <h3 className="text-lg font-medium text-white">Completed Tasks</h3>
              <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-md">
                {completedTasks.length}
              </span>
            </div>
            <button 
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-orange-400 transition-colors"
              onClick={() => setShowCompletedTasks(!showCompletedTasks)}
            >
              {showCompletedTasks ? (
                <>
                  <FaEyeSlash className="text-orange-400" /> 
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <FaEye className="text-orange-400" /> 
                  <span>Show</span>
                </>
              )}
            </button>
          </div>
          
          {showCompletedTasks && (
            completedTasks.length === 0 ? (
              <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 text-center text-gray-400">
                <p>No completed tasks yet. Get started!</p>
              </div>
            ) : (
              <div className="opacity-80 hover:opacity-100 transition-opacity duration-300">
                <TaskList 
                  tasks={completedTasks} 
                  onEdit={(task) => handleEditTask(completedTasks.findIndex(t => t.$id === task.$id), true)}
                  onDelete={(taskId) => handleDeleteTask(taskId)}
                  onToggleComplete={handleToggleComplete} 
                />
              </div>
            )
          )}
          
          {!showCompletedTasks && completedTasks.length > 0 && (
            <button
              onClick={() => setShowCompletedTasks(true)}
              className="w-full py-2 border border-gray-700/50 rounded-lg text-gray-400 hover:text-orange-400 hover:border-orange-500/30 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <FaEye />
              <span>Show {completedTasks.length} completed task{completedTasks.length !== 1 ? 's' : ''}</span>
            </button>
          )}
        </div>
      </div>

      {/* Calendar Preview - Updated with icon */}
      <div className="mt-4 sm:mt-6 md:mt-8 p-3 sm:p-4 md:p-6 bg-gradient-to-r from-gray-800/30 to-orange-900/10 rounded-2xl backdrop-blur-sm border border-orange-700/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
            <FaCalendarAlt className="text-orange-400" />
            <span>Upcoming Events</span>
          </h2>
          <Link to="/calendar" className="text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-2">
            <span>View Calendar</span>
            <span className="text-xs">→</span>
          </Link>
        </div>
        <p className="text-gray-400 mt-4">Calendar integration coming soon!</p>
      </div>

      <TaskFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTask} taskToEdit={taskToEdit} />
    </div>
  );
};

// Updated StatCard with icon component - More compact on mobile
const StatCard = ({ title, value, Icon, color = "orange" }) => {
  const borderColorClass = color === "amber" 
    ? "hover:border-amber-500/50"
    : "hover:border-orange-500/50";
  
  return (
    <div className={`bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-lg sm:rounded-xl p-2 sm:p-4 md:p-6 
      ${borderColorClass} transition-all duration-300 flex flex-col justify-center`}>
      <div className="text-lg sm:text-2xl md:text-3xl mb-1 sm:mb-3 md:mb-4 text-orange-400">
        {Icon && <Icon />}
      </div>
      <h3 className="text-[10px] sm:text-sm md:text-base text-gray-400 font-medium">{title}</h3>
      <p className="text-base sm:text-xl md:text-2xl font-bold text-white mt-0.5 md:mt-2">{value}</p>
    </div>
  );
};

// New Priority Tab component
const PriorityTab = ({ active, onClick, count, color = "orange", children }) => {
  // Get appropriate tab styling based on state and color
  const getTabStyles = () => {
    if (active) {
      switch (color) {
        case 'red':
          return 'bg-red-500/20 border-red-500 text-red-400';
        case 'green':
          return 'bg-green-500/20 border-green-500 text-green-400';
        case 'amber':
          return 'bg-amber-500/20 border-amber-500 text-amber-400';
        default:
          return 'bg-orange-500/20 border-orange-500 text-orange-400';
      }
    }
    return 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-gray-600 hover:text-gray-300';
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm border transition-all duration-200 flex items-center gap-2 ${getTabStyles()}`}
    >
      {color === 'red' && active && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
      {color === 'amber' && active && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
      {color === 'green' && active && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
      
      <span>{children}</span>
      <span className={`rounded-full ${active ? 'bg-gray-800/50' : 'bg-gray-700/50'} px-1.5 py-0.5 text-xs`}>
        {count}
      </span>
    </button>
  );
};

export default Dashboard;