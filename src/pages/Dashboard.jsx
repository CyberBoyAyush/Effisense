import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
      updatedTasks[taskToEdit] = newTask;
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
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          Logout
        </button>
      </div>

      <p className="text-gray-600 mt-2">This is your Effisense dashboard.</p>

      {/* Add Task Button */}
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleAddTask}>
        + Add Task
      </button>

      {/* Task List Component */}
      <TaskList tasks={tasks} onEdit={handleEditTask} onDelete={handleDeleteTask} />

      {/* Task Form Modal */}
      <TaskFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTask} taskToEdit={taskToEdit} />

      {/* Google Calendar Placeholder */}
      <div className="mt-6 p-4 bg-gray-200 rounded-lg">
        <h2 className="text-lg font-semibold">📅 Google Calendar (Coming Soon)</h2>
        <p className="text-gray-600">Your scheduled events will appear here.</p>
      </div>
    </div>
  );
};

export default Dashboard;