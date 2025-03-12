import React, { useState, useEffect, useRef } from "react";

const TaskFormModal = ({ isOpen, onClose, onSave, taskToEdit, defaultDateTime }) => {
  // Form fields state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [time, setTime] = useState("12:00");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("pending");
  const [category, setCategory] = useState("work");
  const [syncWithGoogle, setSyncWithGoogle] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState("daily");
  const [enableReminders, setEnableReminders] = useState(false);
  const [reminderTime, setReminderTime] = useState("15");
  
  // Form validation
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // AI suggestion for optimal time (mock data - in a real app, this would come from the backend)
  const aiSuggestion = "Tomorrow at 10:00 AM";

  // Add state to track if task is a recurring instance that's being rescheduled
  const [isInstanceReschedule, setIsInstanceReschedule] = useState(false);

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      // Reset touched state
      setTouched({});
      setErrors({});
      
      // Populate form with existing task data or default values
      if (taskToEdit) {
        setTitle(taskToEdit.title || "");
        setDescription(taskToEdit.description || "");
        setPriority(taskToEdit.priority || "medium");
        setStatus(taskToEdit.status || "pending");
        setCategory(taskToEdit.category || "work");
        setSyncWithGoogle(taskToEdit.syncWithGoogle || false);
        setIsRecurring(taskToEdit.isRecurring || false);
        setRecurringType(taskToEdit.recurringType || "daily");
        setEnableReminders(taskToEdit.enableReminders || false);
        setReminderTime(taskToEdit.reminderTime || "15");
        
        // Handle deadline date and time
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
        // Use the provided default date and time
        const date = new Date(defaultDateTime);
        const localDate = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
        const localTime = date.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        });
        
        setDeadline(localDate);
        setTime(localTime);
        // Reset other fields to defaults
        setPriority("medium");
        setStatus("pending");
        setCategory("work");
        setSyncWithGoogle(false);
        setIsRecurring(false);
        setRecurringType("daily");
        setEnableReminders(false);
        setReminderTime("15");
      } else {
        // Set current time as default
        const now = new Date();
        setDeadline(now.toLocaleDateString('en-CA'));
        setTime(now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        }));
        // Reset other fields to defaults
        setPriority("medium");
        setStatus("pending");
        setCategory("work");
        setSyncWithGoogle(false);
        setIsRecurring(false);
        setRecurringType("daily");
        setEnableReminders(false);
        setReminderTime("15");
      }

      // Check if this is a recurring task instance being rescheduled
      if (taskToEdit?.isRecurringInstance || taskToEdit?.parentTaskId) {
        setIsInstanceReschedule(true);
      } else {
        setIsInstanceReschedule(false);
      }
    }
  }, [isOpen, taskToEdit, defaultDateTime]);

  // Handle field validation on blur
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateField(field);
  };

  // Validate a single field
  const validateField = (field) => {
    let newErrors = { ...errors };
    
    if (field === 'title' && !title.trim()) {
      newErrors.title = 'Title is required';
    } else if (field === 'title') {
      delete newErrors.title;
    }
    
    if (field === 'deadline' && !deadline) {
      newErrors.deadline = 'Deadline date is required';
    } else if (field === 'deadline') {
      delete newErrors.deadline;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate all fields
  const validateForm = () => {
    let newErrors = {};
    let newTouched = {};
    
    // Mark all fields as touched
    ['title', 'deadline', 'time'].forEach(field => {
      newTouched[field] = true;
    });
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!deadline) {
      newErrors.deadline = 'Deadline date is required';
    }
    
    setErrors(newErrors);
    setTouched(newTouched);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    // Create a new Date object with the input values
    const [year, month, day] = deadline.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const dateTime = new Date(year, month - 1, day, hours, minutes);

    const newTask = {
      title,
      description,
      deadline: dateTime.toISOString(),
      priority,
      status,
      category,
      syncWithGoogle,
      isRecurring,
      recurringType: isRecurring ? recurringType : undefined,
      enableReminders,
      reminderTime: enableReminders ? reminderTime : undefined
    };
    
    // Add metadata for recurring instances when rescheduling
    if (isInstanceReschedule && taskToEdit) {
      newTask.parentTaskId = taskToEdit.parentTaskId || taskToEdit.id;
      newTask.isRescheduledInstance = true;
      newTask.originalDate = taskToEdit.deadline;
    }
    
    onSave(newTask);
    onClose();
  };

  // Apply AI suggestion
  const applyAiSuggestion = () => {
    // In a real app, this would parse the AI suggestion and set the date and time
    // For now, using mock data
    setDeadline("2023-10-12");
    setTime("10:00");
  };

  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-[100] bg-gray-900/80 backdrop-blur-sm flex items-center justify-center touch-none overflow-y-auto py-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Centered Modal Container */}
      <div className="w-[95%] sm:w-[90%] max-w-lg mx-auto my-auto bg-gray-800 rounded-2xl shadow-xl
        flex flex-col border border-orange-700/30 transform-gpu">
        
        {/* Header with context about rescheduling */}
        <div className="p-4 bg-gradient-to-r from-gray-800/80 to-orange-950/20 border-b border-orange-700/30 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
            {taskToEdit 
              ? isInstanceReschedule 
                ? "Reschedule Task" 
                : "Edit Task" 
              : "Add New Task"
            }
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

        {/* Show info about recurring task if rescheduling */}
        {isInstanceReschedule && (
          <div className="px-4 py-2 bg-orange-500/10 border-b border-orange-500/20">
            <p className="text-orange-300 text-xs flex items-center gap-2">
              <span className="text-sm">🔄</span>
              <span>This is a recurring task. Your changes will create a new task instance.</span>
            </p>
          </div>
        )}

        {/* Scrollable Form */}
        <div className="overflow-y-auto flex-grow px-4 py-5">
          <form id="taskForm" onSubmit={handleSubmit} className="space-y-5">
            {/* Title Field */}
            <div>
              <label htmlFor="title" className="text-gray-300 text-sm font-medium block mb-1">
                Title <span className="text-orange-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="Enter task title"
                className={`w-full p-2.5 bg-gray-900/50 border rounded-lg
                  text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1
                  focus:ring-orange-500 focus:border-transparent
                  ${touched.title && errors.title ? 'border-red-500' : 'border-gray-700'}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleBlur('title')}
                required
                autoComplete="off"
              />
              {touched.title && errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="text-gray-300 text-sm font-medium block mb-1">
                Description
              </label>
              <textarea
                id="description"
                placeholder="Enter task details"
                className="w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg
                  text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1
                  focus:ring-orange-500 focus:border-transparent min-h-[80px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Priority and Status in two columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Priority Dropdown */}
              <div>
                <label htmlFor="priority" className="text-gray-300 text-sm font-medium block mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  className="w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg
                    text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f97316'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
                           backgroundRepeat: 'no-repeat', 
                           backgroundPosition: 'right 0.5rem center',
                           backgroundSize: '1.5em 1.5em',
                           paddingRight: '2.5rem' }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Status Dropdown */}
              <div>
                <label htmlFor="status" className="text-gray-300 text-sm font-medium block mb-1">
                  Status
                </label>
                <select
                  id="status"
                  className="w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg
                    text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f97316'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
                           backgroundRepeat: 'no-repeat', 
                           backgroundPosition: 'right 0.5rem center',
                           backgroundSize: '1.5em 1.5em',
                           paddingRight: '2.5rem' }}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Category and Google Calendar Sync */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Dropdown */}
              <div>
                <label htmlFor="category" className="text-gray-300 text-sm font-medium block mb-1">
                  Category
                </label>
                <select
                  id="category"
                  className="w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg
                    text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f97316'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
                           backgroundRepeat: 'no-repeat', 
                           backgroundPosition: 'right 0.5rem center',
                           backgroundSize: '1.5em 1.5em',
                           paddingRight: '2.5rem' }}
                >
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="health">Health</option>
                </select>
              </div>

              {/* Google Calendar Sync Toggle */}
              <div className="flex items-center h-full mt-6">
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={syncWithGoogle}
                    onChange={() => setSyncWithGoogle(!syncWithGoogle)}
                  />
                  <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-orange-600 
                    peer-focus:ring-2 peer-focus:ring-orange-500/30
                    after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white 
                    after:rounded-full after:h-5 after:w-5 after:transition-all 
                    peer-checked:after:translate-x-5"></div>
                  <span className="ml-3 text-sm font-medium text-gray-300">
                    Sync with Google Calendar
                  </span>
                </label>
              </div>
            </div>

            {/* Date and Time Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="deadline" className="text-gray-300 text-sm font-medium block mb-1">
                  Date <span className="text-orange-500">*</span>
                </label>
                <input
                  id="deadline"
                  type="date"
                  className={`w-full p-2.5 bg-gray-900/50 border rounded-lg
                    text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500
                    ${touched.deadline && errors.deadline ? 'border-red-500' : 'border-gray-700'}`}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  onBlur={() => handleBlur('deadline')}
                />
                {touched.deadline && errors.deadline && (
                  <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>
                )}
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

            {/* AI Suggestion */}
            <div className="bg-gray-900/40 p-3 rounded-lg border border-orange-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-orange-400 text-sm">🤖 AI Suggested Time:</span>
                  <span className="text-sm text-gray-300">{aiSuggestion}</span>
                </div>
                <button
                  type="button"
                  onClick={applyAiSuggestion}
                  className="text-xs bg-orange-600/20 text-orange-400 px-2 py-1 rounded
                    hover:bg-orange-600/30 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Recurring Task Toggle */}
            <div className="border-t border-gray-700/50 pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isRecurring}
                    onChange={() => setIsRecurring(!isRecurring)}
                  />
                  <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-orange-600 
                    peer-focus:ring-2 peer-focus:ring-orange-500/30
                    after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white 
                    after:rounded-full after:h-5 after:w-5 after:transition-all 
                    peer-checked:after:translate-x-5"></div>
                  <span className="ml-3 text-sm font-medium text-gray-300">
                    Recurring Task
                  </span>
                </label>
              </div>

              {isRecurring && (
                <div className="bg-gray-800/50 p-3 rounded-lg mt-2">
                  <label htmlFor="recurringType" className="text-gray-300 text-sm font-medium block mb-1">
                    Repeat
                  </label>
                  <select
                    id="recurringType"
                    className="w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg
                      text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none"
                    value={recurringType}
                    onChange={(e) => setRecurringType(e.target.value)}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f97316'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
                             backgroundRepeat: 'no-repeat', 
                             backgroundPosition: 'right 0.5rem center',
                             backgroundSize: '1.5em 1.5em',
                             paddingRight: '2.5rem' }}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}
            </div>

            {/* Reminder Toggle */}
            <div className="border-t border-gray-700/50 pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={enableReminders}
                    onChange={() => setEnableReminders(!enableReminders)}
                  />
                  <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-orange-600 
                    peer-focus:ring-2 peer-focus:ring-orange-500/30
                    after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white 
                    after:rounded-full after:h-5 after:w-5 after:transition-all 
                    peer-checked:after:translate-x-5"></div>
                  <span className="ml-3 text-sm font-medium text-gray-300">
                    Enable Reminders
                  </span>
                </label>
              </div>

              {enableReminders && (
                <div className="bg-gray-800/50 p-3 rounded-lg mt-2">
                  <label htmlFor="reminderTime" className="text-gray-300 text-sm font-medium block mb-1">
                    Remind me before
                  </label>
                  <select
                    id="reminderTime"
                    className="w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg
                      text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f97316'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
                             backgroundRepeat: 'no-repeat', 
                             backgroundPosition: 'right 0.5rem center',
                             backgroundSize: '1.5em 1.5em',
                             paddingRight: '2.5rem' }}
                  >
                    <option value="5">5 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="1440">1 day</option>
                  </select>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer with action buttons */}
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
              {taskToEdit 
                ? isInstanceReschedule 
                  ? "Reschedule" 
                  : "Update" 
                : "Add"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFormModal;