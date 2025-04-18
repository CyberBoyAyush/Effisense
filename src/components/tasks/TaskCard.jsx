import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaRegClock, FaCalendarAlt, FaRegCheckCircle, FaRegCircle, 
  FaEdit, FaTrashAlt, FaExclamationCircle, FaTags, FaLayerGroup,
  FaRecycle, FaBullhorn
} from "react-icons/fa";
import { toggleTaskCompletion } from "../../utils/database"; // Import the specialized function

const TaskCard = ({ task, onEdit, onDelete, onToggleComplete, setOpenTaskDetails, usePortal = false, isDeleting = false }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Format deadline date for display
  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get deadline status (overdue, today, upcoming)
  const getDeadlineStatus = () => {
    if (!task.deadline) return "none";
    
    const now = new Date();
    const deadline = new Date(task.deadline);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (deadline < today) return "overdue";
    if (deadline < tomorrow) return "today";
    return "upcoming";
  };
  
  // Get appropriate status color and icon
  const getStatusDisplay = () => {
    const status = getDeadlineStatus();
    
    switch (status) {
      case "overdue":
        return { color: "text-red-400", bgColor: "bg-red-400/10", icon: <FaExclamationCircle /> };
      case "today":
        return { color: "text-orange-400", bgColor: "bg-orange-400/10", icon: <FaRegClock /> };
      case "upcoming":
        return { color: "text-blue-400", bgColor: "bg-blue-400/10", icon: <FaCalendarAlt /> };
      default:
        return { color: "text-gray-400", bgColor: "bg-gray-400/10", icon: <FaRegClock /> };
    }
  };
  
  // Get priority display properties
  const getPriorityDisplay = () => {
    switch (task.priority) {
      case "high":
        return { color: "text-red-400", bgColor: "bg-red-400/10", label: "High" };
      case "medium":
        return { color: "text-amber-400", bgColor: "bg-amber-400/10", label: "Medium" };
      case "low":
        return { color: "text-green-400", bgColor: "bg-green-400/10", label: "Low" };
      default:
        return { color: "text-amber-400", bgColor: "bg-amber-400/10", label: "Medium" };
    }
  };

  // Get category display properties
  const getCategoryDisplay = () => {
    switch (task.category) {
      case "work":
        return { color: "text-blue-400", bgColor: "bg-blue-400/10", label: "Work" };
      case "personal":
        return { color: "text-purple-400", bgColor: "bg-purple-400/10", label: "Personal" };
      case "health":
        return { color: "text-green-400", bgColor: "bg-green-400/10", label: "Health" };
      default:
        return { color: "text-blue-400", bgColor: "bg-blue-400/10", label: "Work" };
    }
  };

  const deadlineStatus = getStatusDisplay();
  const priorityDisplay = getPriorityDisplay();
  const categoryDisplay = getCategoryDisplay();
  
  // Calculate if task is overdue
  const isOverdue = getDeadlineStatus() === "overdue" && !task.completed;
  
  // Handle click on the card - open details view
  const handleCardClick = (e) => {
    // Check if click was on a button or its parent, don't open details in that case
    if (e.target.closest('button')) {
      return;
    }
    
    if (usePortal && setOpenTaskDetails) {
      // When using portals, we set the content in the parent component
      setOpenTaskDetails(
        <TaskDetailsModal 
          task={task} 
          onClose={() => setOpenTaskDetails(null)} 
          onEdit={onEdit} 
          onToggleComplete={() => handleToggleComplete()}
        />
      );
    } else {
      // Standard behavior - toggle local state
      setShowDetails(true);
    }
  };

  const handleDelete = () => {
    onDelete(task);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(task); // Pass entire task object
  };
  
  // Enhanced toggle handler - removed taskCache dependency
  const handleToggleComplete = async (e) => {
    if (e) e.stopPropagation();
    
    try {
      const isCurrentlyCompleted = task.status === 'completed';
      if (onToggleComplete) {
        // Pass the full task object for backend update
        await onToggleComplete(task, !isCurrentlyCompleted);
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  return (
    <>
      {/* Main Card - Clickable */}
      <motion.div 
        className={`p-3 sm:p-4 md:p-5 bg-gray-800/40 backdrop-blur-sm border 
          rounded-xl transition-all duration-300 cursor-pointer group
          ${isOverdue 
            ? 'border-red-500/40 hover:border-red-500/60' 
            : task.completed 
              ? 'bg-gray-900/50 border-gray-600/30 hover:border-gray-600/50' 
              : 'border-gray-700/50 hover:border-orange-500/50'
          }`}
        onClick={handleCardClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        layout
      >
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-start gap-3 flex-1 w-full">
            {/* Checkbox */}
            <button
              onClick={(e) => handleToggleComplete(e)}
              className="mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
              aria-label={task.status === 'completed' ? "Mark as incomplete" : "Mark as complete"}
            >
              {task.status === 'completed' ? (
                <FaRegCheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <FaRegCircle className="w-6 h-6 text-gray-500 hover:text-orange-500 transition-colors" />
              )}
            </button>
            
            <div className="space-y-2 min-w-0 flex-1">
              {/* Title with enhanced completed styling */}
              <h3 className={`text-base sm:text-lg font-semibold transition-all duration-200
                ${task.status === 'completed'
                  ? 'text-gray-500 line-through decoration-gray-500 decoration-2' 
                  : 'text-white group-hover:text-orange-400'}`}
              >
                {task.title}
              </h3>
              
              {/* Description with enhanced completed styling and clickable links */}
              {task.description && (
                <p className={`text-gray-200 text-sm sm:text-base line-clamp-2 whitespace-pre-line
                  ${task.completed ? 'line-through decoration-gray-500 opacity-50' : ''}`}
                  dangerouslySetInnerHTML={{ __html: formatTextWithLinks(task.description) }}
                />
              )}
              
              {/* Tags and metadata row */}
              <div className="flex items-center flex-wrap gap-2 mt-2">
                {/* Deadline with status */}
                <span className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full
                  ${deadlineStatus.bgColor} ${deadlineStatus.color}`}>
                  {deadlineStatus.icon}
                  <span>{formatDate(task.deadline)}</span>
                </span>
                
                {/* Priority tag */}
                <span className={`hidden sm:flex items-center gap-1.5 text-xs px-2 py-1 rounded-full
                  ${priorityDisplay.bgColor} ${priorityDisplay.color}`}>
                  <FaExclamationCircle />
                  <span>{priorityDisplay.label}</span>
                </span>
                
                {/* Category tag */}
                <span className={`hidden sm:flex items-center gap-1.5 text-xs px-2 py-1 rounded-full
                  ${categoryDisplay.bgColor} ${categoryDisplay.color}`}>
                  <FaTags />
                  <span>{categoryDisplay.label}</span>
                </span>
                
                {/* Recurring indicator */}
                {task.isRecurring && (
                  <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full
                    bg-violet-400/10 text-violet-300">
                    <FaRecycle />
                    <span>Recurring</span>
                  </span>
                )}
                
                {/* Reminder indicator */}
                {task.enableReminders && (
                  <span className="hidden md:flex items-center gap-1.5 text-xs px-2 py-1 rounded-full
                    bg-amber-400/10 text-amber-300">
                    <FaBullhorn />
                    <span>Reminder</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 w-full sm:w-auto sm:flex-col items-end opacity-60 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="flex-1 sm:flex-initial px-3 sm:px-3 py-1.5 sm:py-1.5 text-sm bg-orange-600/20 text-orange-400 rounded-lg hover:bg-orange-600/30 
                transition-all duration-200 border border-orange-500/20 flex items-center justify-center gap-2"
              aria-label="Edit task"
            >
              <FaEdit className="w-3.5 h-3.5" />
              <span className="sm:sr-only">Edit</span>
            </button>
            <button
              onClick={handleDelete}
              className={`flex-1 sm:flex-initial px-3 sm:px-3 py-1.5 sm:py-1.5 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 
                transition-all duration-200 border border-red-500/20 flex items-center justify-center gap-2
                ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Delete task"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <svg className="animate-spin h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              ) : (
                <>
                  <FaTrashAlt className="w-3.5 h-3.5" />
                  <span className="sm:sr-only">Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Detailed Task View Modal - Only render when not using portal */}
      {!usePortal && (
        <AnimatePresence>
          {showDetails && (
            <TaskDetailsModal 
              task={task} 
              onClose={() => setShowDetails(false)}
              onEdit={onEdit}
              onToggleComplete={handleToggleComplete}
            />
          )}
        </AnimatePresence>
      )}
    </>
  );
};

// Extract the details modal to a separate component for reuse
const TaskDetailsModal = ({ task, onClose, onEdit, onToggleComplete }) => {
  // Get various display properties for the task
  const deadlineStatus = getStatusDisplay(task);
  const priorityDisplay = getPriorityDisplay(task);
  const categoryDisplay = getCategoryDisplay(task);
  const isOverdue = getDeadlineStatus(task) === "overdue" && !task.completed;
  
  return (
    <motion.div 
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="bg-gray-800/95 rounded-2xl max-w-2xl w-full border border-gray-700/50 overflow-hidden"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/80 to-orange-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* Checkbox */}
              <button
                onClick={onToggleComplete}
                className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200
                  ${task.status === 'completed' 
                    ? 'text-green-500' 
                    : 'text-gray-400 hover:text-orange-500'
                  }`}
              >
                {task.status === 'completed' ? (
                  <FaRegCheckCircle className="w-6 h-6" />
                ) : (
                  <FaRegCircle className="w-6 h-6" />
                )}
              </button>
              
              <h2 className={`text-xl font-semibold break-words mr-4
                ${task.completed 
                  ? 'text-gray-400 line-through' 
                  : 'bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent'
                }`}
              >
                {task.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-orange-400 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Task Details Section */}
          <div className="space-y-4">
            {/* Status and Priority Info */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-900/30 rounded-xl p-4 flex items-center gap-3">
                <div className={`${priorityDisplay.color} p-2 rounded-lg ${priorityDisplay.bgColor}`}>
                  <FaExclamationCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-400">Priority</h3>
                  <p className={`font-medium ${priorityDisplay.color}`}>{priorityDisplay.label}</p>
                </div>
              </div>
              
              <div className="bg-gray-900/30 rounded-xl p-4 flex items-center gap-3">
                <div className={`${categoryDisplay.color} p-2 rounded-lg ${categoryDisplay.bgColor}`}>
                  <FaLayerGroup className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-400">Category</h3>
                  <p className={`font-medium ${categoryDisplay.color}`}>{categoryDisplay.label}</p>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-300">Description</h3>
              <div className="prose prose-invert prose-sm max-w-none bg-gray-900/30 p-4 rounded-xl">
                {task.description ? (
                  <p className="text-gray-100 whitespace-pre-wrap break-words"
                     dangerouslySetInnerHTML={{ __html: formatTextWithLinks(task.description) }}
                  />
                ) : (
                  <p className="text-gray-500 italic">No description provided</p>
                )}
              </div>
            </div>
            
            {/* Time Section */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-300">Timing Details</h3>
              <div className="bg-gray-900/30 p-4 rounded-xl space-y-3">
                {/* Deadline */}
                <div className="flex items-center gap-3">
                  <div className={`${deadlineStatus.color} p-2 rounded-lg ${deadlineStatus.bgColor}`}>
                    {deadlineStatus.icon}
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400">Deadline</h4>
                    <p className="text-white">
                      {formatDate(task.deadline)}
                      {isOverdue && <span className="text-red-400 ml-2">(Overdue)</span>}
                    </p>
                  </div>
                </div>
                
                {/* Recurring Information - Only show if recurring */}
                {task.isRecurring && (
                  <div className="flex items-center gap-3">
                    <div className="text-violet-300 p-2 rounded-lg bg-violet-400/10">
                      <FaRecycle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm text-gray-400">Recurring</h4>
                      <p className="text-white capitalize">
                        {task.recurringType || "Daily"}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Reminder Information - Only show if reminders enabled */}
                {task.enableReminders && (
                  <div className="flex items-center gap-3">
                    <div className="text-amber-300 p-2 rounded-lg bg-amber-400/10">
                      <FaBullhorn className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm text-gray-400">Reminder</h4>
                      <p className="text-white">
                        {task.reminderTime === "5" && "5 minutes before"}
                        {task.reminderTime === "15" && "15 minutes before"}
                        {task.reminderTime === "30" && "30 minutes before"}
                        {task.reminderTime === "60" && "1 hour before"}
                        {task.reminderTime === "1440" && "1 day before"}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Google Calendar Sync - Only show if sync enabled */}
                {task.syncWithGoogle && (
                  <div className="flex items-center gap-3">
                    <div className="text-blue-300 p-2 rounded-lg bg-blue-400/10">
                      <FaCalendarAlt className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm text-gray-400">Sync</h4>
                      <p className="text-white">
                        Synced with Google Calendar
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700/50 bg-gray-800/70">
          <span className="text-sm text-gray-400">
            Created: {formatDate(task.createdAt)}
          </span>
          <div className="flex gap-3">
            <button
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="px-4 py-2 bg-orange-600/20 text-orange-400 rounded-lg hover:bg-orange-600/30 
                transition-all duration-200 border border-orange-500/20 flex items-center gap-2"
            >
              <FaEdit />
              <span>Edit Task</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Helper functions moved outside for reuse by both components
const getDeadlineStatus = (task) => {
  if (!task.deadline) return "none";
  
  const now = new Date();
  const deadline = new Date(task.deadline);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (deadline < today) return "overdue";
  if (deadline < tomorrow) return "today";
  return "upcoming";
};

const getStatusDisplay = (task) => {
  const status = getDeadlineStatus(task);
  
  switch (status) {
    case "overdue":
      return { color: "text-red-400", bgColor: "bg-red-400/10", icon: <FaExclamationCircle /> };
    case "today":
      return { color: "text-orange-400", bgColor: "bg-orange-400/10", icon: <FaRegClock /> };
    case "upcoming":
      return { color: "text-blue-400", bgColor: "bg-blue-400/10", icon: <FaCalendarAlt /> };
    default:
      return { color: "text-gray-400", bgColor: "bg-gray-400/10", icon: <FaRegClock /> };
  }
};

const getPriorityDisplay = (task) => {
  switch (task.priority) {
    case "high":
      return { color: "text-red-400", bgColor: "bg-red-400/10", label: "High" };
    case "medium":
      return { color: "text-amber-400", bgColor: "bg-amber-400/10", label: "Medium" };
    case "low":
      return { color: "text-green-400", bgColor: "bg-green-400/10", label: "Low" };
    default:
      return { color: "text-amber-400", bgColor: "bg-amber-400/10", label: "Medium" };
  }
};

const getCategoryDisplay = (task) => {
  switch (task.category) {
    case "work":
      return { color: "text-blue-400", bgColor: "bg-blue-400/10", label: "Work" };
    case "personal":
      return { color: "text-purple-400", bgColor: "bg-purple-400/10", label: "Personal" };
    case "health":
      return { color: "text-green-400", bgColor: "bg-green-400/10", label: "Health" };
    default:
      return { color: "text-blue-400", bgColor: "bg-blue-400/10", label: "Work" };
  }
};

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return "No deadline";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to make URLs clickable
const formatTextWithLinks = (text) => {
  if (!text) return '';
  
  // URL regex pattern
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Replace URLs with clickable links, with proper event handling
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-orange-400 hover:text-orange-300 hover:underline" onclick="event.stopPropagation();">${url}</a>`;
  });
};

export default TaskCard;