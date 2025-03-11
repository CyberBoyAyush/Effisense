import React, { useState, useEffect } from "react";
import TaskList from "../components/tasks/TaskList";
import TaskFormModal from "../components/tasks/TaskFormModal";
import { getTasks, addTask, updateTask, deleteTask } from '../utils/taskStorage';

const Tasks = () => {
  const [filter, setFilter] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = getTasks();
    setTasks(savedTasks);
  }, []);

  // Handle task operations
  const handleAddTask = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

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

  const handleEditTask = (index) => {
    setTaskToEdit({ ...tasks[index], index });
    setIsModalOpen(true);
  };

  const handleDeleteTask = (index) => {
    const taskId = tasks[index].id;
    const updatedTasks = deleteTask(taskId);
    setTasks(updatedTasks);
  };

  const handleToggleComplete = (index) => {
    const task = tasks[index];
    const updatedTasks = updateTask(task.id, { completed: !task.completed });
    setTasks(updatedTasks);
  };

  const filteredTasks = {
    all: tasks,
    active: tasks.filter(t => !t.completed),
    completed: tasks.filter(t => t.completed)
  }[filter];

  return (
    <div className="p-6 text-gray-200">
      {/* Header section */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-700/50">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Task Management</h1>
            <p className="text-gray-400 mt-2">Organize and track your tasks efficiently</p>
          </div>
          <button
            onClick={handleAddTask}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
              transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            <span>Add Task</span>
            <span className="text-xl">+</span>
          </button>
        </div>
        
        <div className="mt-6 flex gap-4">
          <FilterButton current={filter} value="all" onClick={setFilter}>
            All Tasks ({tasks.length})
          </FilterButton>
          <FilterButton current={filter} value="active" onClick={setFilter}>
            Active ({tasks.filter(t => !t.completed).length})
          </FilterButton>
          <FilterButton current={filter} value="completed" onClick={setFilter}>
            Completed ({tasks.filter(t => t.completed).length})
          </FilterButton>
        </div>
      </div>

      <div className="mt-8">
        <TaskList 
          tasks={filteredTasks} 
          onEdit={handleEditTask} 
          onDelete={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
        />
      </div>

      <TaskFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTask} 
        taskToEdit={taskToEdit} 
      />
    </div>
  );
};

const FilterButton = ({ current, value, onClick, children }) => (
  <button
    onClick={() => onClick(value)}
    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
      current === value
        ? 'bg-blue-600 text-white'
        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
    }`}
  >
    {children}
  </button>
);

export default Tasks;