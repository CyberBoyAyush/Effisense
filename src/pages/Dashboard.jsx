import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import TaskList from "../components/tasks/TaskList";
import TaskFormModal from "../components/tasks/TaskFormModal";
import { getTasks, addTask, updateTask, deleteTask } from '../utils/taskStorage';
import { 
  FaHandPaper, FaPlus, FaListUl, FaCalendarAlt, 
  FaClipboardList, FaCheckCircle, FaHourglassHalf
} from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  useEffect(() => {
    // Load tasks when component mounts
    const savedTasks = getTasks();
    setTasks(savedTasks);

    // Check authentication
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
      navigate("/login");
    } else {
      setUser(loggedInUser);
    }
  }, [navigate]);

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
    const taskToEdit = tasks[index];
    setTaskToEdit({ ...taskToEdit, index });
    setIsModalOpen(true);
  };

  // Delete task
  const handleDeleteTask = (index) => {
    const taskId = tasks[index].id;
    const updatedTasks = deleteTask(taskId);
    setTasks(updatedTasks);
  };

  // Add task toggle functionality
  const handleToggleComplete = (index) => {
    const task = tasks[index];
    if (task?.id) {
      const updatedTasks = updateTask(task.id, { 
        ...task, 
        completed: !task.completed 
      });
      setTasks(updatedTasks);
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
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

      {/* Statistics Cards - Updated with better icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-4 sm:mt-6 md:mt-8">
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
        
        <TaskList tasks={tasks} onEdit={handleEditTask} onDelete={handleDeleteTask} onToggleComplete={handleToggleComplete} />
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

// Updated StatCard with icon component
const StatCard = ({ title, value, Icon, color = "orange" }) => {
  const borderColorClass = color === "amber" 
    ? "hover:border-amber-500/50"
    : "hover:border-orange-500/50";
  
  return (
    <div className={`bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-3 sm:p-4 md:p-6 
      ${borderColorClass} transition-all duration-300`}>
      <div className="text-xl sm:text-2xl md:text-3xl mb-2 sm:mb-3 md:mb-4 text-orange-400">
        {Icon && <Icon />}
      </div>
      <h3 className="text-xs sm:text-sm md:text-base text-gray-400 font-medium">{title}</h3>
      <p className="text-lg sm:text-xl md:text-2xl font-bold text-white mt-1 md:mt-2">{value}</p>
    </div>
  );
};

export default Dashboard;