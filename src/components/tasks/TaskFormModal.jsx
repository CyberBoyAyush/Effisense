import React, { useState, useEffect } from "react";

const TaskFormModal = ({ isOpen, onClose, onSave, taskToEdit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setDeadline(taskToEdit.deadline);
    } else {
      setTitle("");
      setDescription("");
      setDeadline("");
    }
  }, [taskToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;
    
    const newTask = { title, description, deadline };
    onSave(newTask);
    onClose();
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-gray-800/90 p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-700/50
        backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white">
          {taskToEdit ? "Edit Task" : "Add New Task"}
        </h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="title" className="text-gray-300 text-sm font-medium block mb-1">
              Task Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="Enter task title"
              className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-lg
                text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2
                focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="text-gray-300 text-sm font-medium block mb-1">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Enter task description"
              className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-lg
                text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2
                focus:ring-blue-500 focus:border-transparent transition-all duration-200
                min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="deadline" className="text-gray-300 text-sm font-medium block mb-1">
              Deadline
            </label>
            <input
              id="deadline"
              type="date"
              className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-lg
                text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500
                focus:border-transparent transition-all duration-200"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600
                transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                transform hover:scale-105 transition-all duration-200
                shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            >
              {taskToEdit ? "Update Task" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
};

export default TaskFormModal;