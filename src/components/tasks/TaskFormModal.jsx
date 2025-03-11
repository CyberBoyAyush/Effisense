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
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex sm:items-center justify-center z-50">
      <div className="w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-md mx-auto">
        <div className="flex flex-col h-full sm:h-auto bg-gray-800/90 sm:rounded-2xl shadow-lg 
          border border-gray-700/50 backdrop-blur-sm overflow-hidden">
          
          {/* Sticky Header */}
          <div className="sticky top-0 z-20 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700/50 p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {taskToEdit ? "Edit Task" : "Add New Task"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto">
            <form id="taskForm" onSubmit={handleSubmit} className="p-4 space-y-4">
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
            </form>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 z-20 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700/50 
            p-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600
                transition-all duration-200 flex-1 sm:flex-initial"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="taskForm"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                transition-all duration-200 flex-1 sm:flex-initial"
            >
              {taskToEdit ? "Update Task" : "Add Task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default TaskFormModal;