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

  const filteredTasks = {
    all: tasks,
    active: tasks.filter(t => !t.completed),
    completed: tasks.filter(t => t.completed),
    today: tasks.filter(t => isDateEqual(t.deadline, today)),
    yesterday: tasks.filter(t => isDateEqual(t.deadline, yesterday)),
    tomorrow: tasks.filter(t => isDateEqual(t.deadline, tomorrow)),
    weekend: tasks.filter(t => isWeekend(t.deadline))
  }[filter];

  return (
    <div className="p-2 sm:p-4 md:p-6 text-gray-200">
      {/* Header section - Made more compact for mobile */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-4 sm:p-6 md:p-8 rounded-2xl backdrop-blur-sm border border-gray-700/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Task Management</h1>
            <p className="text-sm md:text-base text-gray-400 mt-1 md:mt-2">Organize and track your tasks efficiently</p>
          </div>
          <button
            onClick={handleAddTask}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
              transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>Add Task</span>
            <span className="text-xl">+</span>
          </button>
        </div>
        
        {/* Filter buttons - Made scrollable on mobile */}
        <div className="mt-4 sm:mt-6 flex gap-2 md:gap-4 overflow-x-auto pb-2 -mx-1 px-1">
          <FilterButton current={filter} value="all" onClick={setFilter}>
            All ({tasks.length})
          </FilterButton>
          <FilterButton current={filter} value="active" onClick={setFilter}>
            Active ({tasks.filter(t => !t.completed).length})
          </FilterButton>
          <FilterButton current={filter} value="completed" onClick={setFilter}>
            Completed ({tasks.filter(t => t.completed).length})
          </FilterButton>
          <FilterButton current={filter} value="yesterday" onClick={setFilter}>
            Yesterday ({tasks.filter(t => isDateEqual(t.deadline, yesterday)).length})
          </FilterButton>
          <FilterButton current={filter} value="today" onClick={setFilter}>
            <span className="flex items-center gap-1">
              <span>Today</span>
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            </span>
            ({tasks.filter(t => isDateEqual(t.deadline, today)).length})
          </FilterButton>
          <FilterButton current={filter} value="tomorrow" onClick={setFilter}>
            Tomorrow ({tasks.filter(t => isDateEqual(t.deadline, tomorrow)).length})
          </FilterButton>
          <FilterButton current={filter} value="weekend" onClick={setFilter}>
            Weekend ({tasks.filter(t => isWeekend(t.deadline)).length})
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

// Update FilterButton to be more compact on mobile
const FilterButton = ({ current, value, onClick, children }) => (
  <button
    onClick={() => onClick(value)}
    className={`px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap text-sm transition-all duration-200 ${
      current === value
        ? 'bg-blue-600 text-white'
        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
    }`}
  >
    {children}
  </button>
);

export default Tasks;