import React, { useState, useEffect } from "react";

const TaskFormModal = ({ isOpen, onClose, onSave, taskToEdit, defaultDateTime }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [time, setTime] = useState("12:00");

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      if (taskToEdit.deadline) {
        const taskDate = new Date(taskToEdit.deadline);
        setDeadline(taskDate.toISOString().split('T')[0]);
        setTime(taskDate.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'Asia/Kolkata'
        }));
      }
    } else if (defaultDateTime) {
      const date = new Date(defaultDateTime);
      const localDate = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      const localTime = date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
      
      setDeadline(localDate);
      setTime(localTime);
    } else {
      const now = new Date();
      setDeadline(now.toLocaleDateString('en-CA'));
      setTime(now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }));
    }
  }, [taskToEdit, defaultDateTime]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;

    // Create a new Date object with the input values
    const [year, month, day] = deadline.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const dateTime = new Date(year, month - 1, day, hours, minutes);

    const newTask = {
      title,
      description,
      deadline: dateTime.toISOString()
    };
    
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="deadline" className="text-gray-300 text-sm font-medium block mb-1">
                Date
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

            <div>
              <label htmlFor="time" className="text-gray-300 text-sm font-medium block mb-1">
                Time
              </label>
              <input
                id="time"
                type="time"
                className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-lg
                  text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500
                  focus:border-transparent transition-all duration-200"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
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