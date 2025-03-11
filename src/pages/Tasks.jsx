import React, { useState } from "react";
import TaskList from "../components/tasks/TaskList";
import TaskFormModal from "../components/tasks/TaskFormModal";

const Tasks = () => {
  const [filter, setFilter] = useState('all');
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTasks = {
    all: tasks,
    active: tasks.filter(t => !t.completed),
    completed: tasks.filter(t => t.completed)
  }[filter];

  return (
    <div className="p-6 text-gray-200">
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-700/50">
        <h1 className="text-3xl font-bold text-white">Task Management</h1>
        <p className="text-gray-400 mt-2">Organize and track your tasks efficiently</p>
        
        <div className="mt-6 flex gap-4">
          <FilterButton current={filter} value="all" onClick={setFilter}>All Tasks</FilterButton>
          <FilterButton current={filter} value="active" onClick={setFilter}>Active</FilterButton>
          <FilterButton current={filter} value="completed" onClick={setFilter}>Completed</FilterButton>
        </div>
      </div>

      <div className="mt-8">
        <TaskList tasks={filteredTasks} />
      </div>
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