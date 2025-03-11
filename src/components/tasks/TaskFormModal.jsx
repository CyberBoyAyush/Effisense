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

  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-[100] bg-gray-900/80 backdrop-blur-sm flex items-center justify-center touch-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Centered Modal Container - Max height limited to prevent scrolling */}
      <div className="w-[95%] sm:w-[90%] max-w-md mx-auto my-auto bg-gray-800 rounded-2xl shadow-xl
        max-h-[80vh] flex flex-col border border-orange-700/30 transform-gpu">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-gray-800/80 to-orange-950/20 border-b border-orange-700/30 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
            {taskToEdit ? "Edit Task" : "Add New Task"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-700/50 text-gray-400 hover:text-orange-300 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form - Takes remaining space with scrolling if needed */}
        <div className="overflow-y-auto flex-grow px-4 py-3">
          <form id="taskForm" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="text-gray-300 text-sm font-medium block mb-1">
                Task Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="Enter task title"
                className="w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg
                  text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1
                  focus:ring-orange-500 focus:border-transparent"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="description" className="text-gray-300 text-sm font-medium block mb-1">
                Description
              </label>
              <textarea
                id="description"
                placeholder="Enter task details"
                className="w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg
                  text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1
                  focus:ring-orange-500 focus:border-transparent min-h-[60px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="deadline" className="text-gray-300 text-sm font-medium block mb-1">
                  Date
                </label>
                <input
                  id="deadline"
                  type="date"
                  className="w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg
                    text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
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
                  className="w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg
                    text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-orange-700/30 p-4 bg-gray-800/90 shrink-0">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-700 text-gray-300 rounded-lg 
                hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="taskForm"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg 
                hover:from-orange-500 hover:to-amber-500 transition-colors font-medium
                shadow-[0_0_10px_rgba(251,146,60,0.3)] hover:shadow-[0_0_15px_rgba(251,146,60,0.4)]"
            >
              {taskToEdit ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFormModal;