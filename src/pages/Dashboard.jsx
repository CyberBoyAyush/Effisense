import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import TaskList from "../components/tasks/TaskList";
import TaskFormModal from "../components/tasks/TaskFormModal";
import { getTasks, addTask, updateTask, deleteTask } from '../utils/taskStorage';
import { 
  FaHandPaper, FaPlus, FaListUl, FaCalendarAlt, 
  FaClipboardList, FaCheckCircle, FaHourglassHalf,
  FaExclamationCircle, FaFilter, FaAngleDown
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

  useEffect(() => {
    // Load tasks when component mounts
    const savedTasks = getTasks();
    setTasks(savedTasks);
    setFilteredTasks(savedTasks);

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

  // Add new task
  const handleAddTask = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  // Save or update a task
  const handleSaveTask = (taskData) => {
    if (taskToEdit) {
      const updatedTasks = updateTask(taskToEdit.id, taskData);
      setTasks(updatedTasks);
    } else {
      const updatedTasks = addTask(taskData);
      setTasks(updatedTasks);
    }
    setIsModalOpen(false);
  };

  // Edit task
  const handleEditTask = (index) => {
    const taskToEdit = filteredTasks[index];
    // Find original task index in the full tasks array
    const originalIndex = tasks.findIndex(t => t.id === taskToEdit.id);
    setTaskToEdit({ ...tasks[originalIndex], index: originalIndex });
    setIsModalOpen(true);
  };

  // Delete task
  const handleDeleteTask = (index) => {
    const taskId = filteredTasks[index].id;
    const updatedTasks = deleteTask(taskId);
    setTasks(updatedTasks);
  };

  // Add task toggle functionality
  const handleToggleComplete = (index) => {
    const task = filteredTasks[index];
    if (task?.id) {
      const updatedTasks = updateTask(task.id, { 
        ...task, 
        completed: !task.completed 
      });
      setTasks(updatedTasks);
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
        
        <TaskList 
          tasks={filteredTasks} 
          onEdit={handleEditTask} 
          onDelete={handleDeleteTask} 
          onToggleComplete={handleToggleComplete} 
        />
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