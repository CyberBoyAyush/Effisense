import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import TaskList from "../components/tasks/TaskList";
import TaskFormModal from "../components/tasks/TaskFormModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
      navigate("/login");
    } else {
      setUser(loggedInUser);
    }

    // Load tasks from localStorage
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(savedTasks);
  }, [navigate]);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Add new task
  const handleAddTask = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  // Save or update a task
  const handleSaveTask = (newTask) => {
    if (taskToEdit !== null) {
      const updatedTasks = [...tasks];
      updatedTasks[taskToEdit.index] = newTask;
      setTasks(updatedTasks);
    } else {
      setTasks([...tasks, newTask]);
    }
    setIsModalOpen(false);
  };

  // Edit task
  const handleEditTask = (index) => {
    setTaskToEdit({ ...tasks[index], index });
    setIsModalOpen(true);
  };

  // Delete task
  const handleDeleteTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  return (
    <div className="p-6 text-gray-200">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-700/50">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Let's make your day more productive.</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <StatCard title="Total Tasks" value={tasks.length} icon="📋" />
        <StatCard title="Completed" value={tasks.filter(t => t.completed).length} icon="✅" />
        <StatCard title="Pending" value={tasks.filter(t => !t.completed).length} icon="⏳" />
      </div>

      {/* Tasks Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Your Tasks</h2>
          <button 
            onClick={handleAddTask}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
              transform hover:scale-105 transition-all duration-200 
              shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2"
          >
            <span>Add Task</span>
            <span className="text-xl">+</span>
          </button>
        </div>
        
        <TaskList tasks={tasks} onEdit={handleEditTask} onDelete={handleDeleteTask} />
      </div>

      {/* Calendar Preview */}
      <div className="mt-8 p-6 bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-2xl backdrop-blur-sm border border-gray-700/50">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
            <span>📅</span>
            <span>Upcoming Events</span>
          </h2>
          <Link to="/calendar" className="text-blue-400 hover:text-blue-300 transition-colors">
            View Calendar →
          </Link>
        </div>
        <p className="text-gray-400 mt-4">Calendar integration coming soon!</p>
      </div>

      <TaskFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTask} taskToEdit={taskToEdit} />
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
    <div className="text-3xl mb-4">{icon}</div>
    <h3 className="text-gray-400 font-medium">{title}</h3>
    <p className="text-2xl font-bold text-white mt-2">{value}</p>
  </div>
);

export default Dashboard;