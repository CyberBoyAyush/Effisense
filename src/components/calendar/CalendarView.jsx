import React, { useState, useEffect } from 'react';
import { getTasks, addTask, updateTask, rescheduleTaskInstance } from '../../utils/taskStorage';
import TaskFormModal from '../tasks/TaskFormModal';
import TaskCard from '../tasks/TaskCard';
import { createPortal } from 'react-dom';

// Helper function to process tasks for calendar views - moved outside of any component
const processTasksForDay = (tasks, date) => {
  return tasks
    .filter(task => {
      const taskDate = new Date(task.deadline);
      return taskDate.toDateString() === date.toDateString();
    })
    .map(task => {
      const startTime = new Date(task.deadline);
      // If endTime exists, use it; otherwise default to 1 hour after start
      const endTime = task.endTime ? new Date(task.endTime) : new Date(startTime.getTime() + 60 * 60 * 1000);
      
      // Calculate positioning values with precise minutes
      const startHour = startTime.getHours();
      const startMinutes = startTime.getMinutes();
      const endHour = endTime.getHours();
      const endMinutes = endTime.getMinutes();
      
      // Duration calculations with precise minutes
      const durationMs = endTime - startTime;
      const durationMinutes = durationMs / (1000 * 60);
      const durationHours = durationMinutes / 60;
      
      // Format duration for display
      let durationText;
      if (durationMinutes < 60) {
        durationText = `${Math.round(durationMinutes)}m`;
      } else {
        const hours = Math.floor(durationHours);
        const minutes = Math.round(durationMinutes % 60);
        durationText = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      }

      return {
        ...task,
        startTime,
        endTime,
        startHour,
        startMinutes,
        endHour,
        endMinutes,
        durationMinutes,
        durationHours,
        durationText
      };
    });
};

// Hour range button component
const HourRangeButton = ({ label, range, setRange, current }) => {
  const isActive = current.start === range.start && current.end === range.end;
  return (
    <button
      onClick={() => setRange(range)}
      className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap
        ${isActive 
          ? 'bg-orange-600 text-white' 
          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
        }`}
    >
      {label}
    </button>
  );
};

const CalendarView = () => {
  const [view, setView] = useState('month'); // 'month', 'week', 'day'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [is24Hour, setIs24Hour] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [openTaskDetails, setOpenTaskDetails] = useState(null);

  useEffect(() => {
    const loadedTasks = getTasks();
    setTasks(loadedTasks);
  }, []);

  // Add CSS styles for calendar positioning
  useEffect(() => {
    // Add a style tag to ensure correct positioning
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      #week-calendar-grid .grid-container, #day-calendar-grid .grid-container {
        position: relative;
        z-index: 1;
      }
      
      /* Ensure time labels are on top of the grid lines */
      #week-calendar-grid .time-label, #day-calendar-grid .time-label {
        position: relative;
        z-index: 2;
        background: inherit;
      }
      
      /* Precise alignment styles */
      #week-calendar-grid > .absolute, #day-calendar-grid > .absolute {
        z-index: 10;
      }
    `;
    document.head.appendChild(styleTag);
    
    // Clean up the style tag when component unmounts
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  const viewOptions = [
    { id: 'month', label: 'Month' },
    { id: 'week', label: 'Week' },
    { id: 'day', label: 'Day' },
  ];

  const navigateCalendar = (direction) => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() + direction);
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() + (direction * 7));
    } else {
      newDate.setDate(currentDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const formatTime = (hour) => {
    if (is24Hour) {
      return `${hour.toString().padStart(2, '0')}:00`;
    }
    const period = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h}:00 ${period}`;
  };

  const getIndianDateTime = (date) => {
    return new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  };

  const handleDateClick = (date, hour = null) => {
    // Create a new date object with the correct local date
    const selectedDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hour || 0,
      0,
      0
    );
    setSelectedDate(selectedDateTime);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData) => {
    const updatedTasks = addTask(taskData);
    setTasks(updatedTasks);
    setIsModalOpen(false);
  };

  const handleTaskClick = (e, task) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Instead of setting selectedTask, we'll use the TaskCard component with portal
    setOpenTaskDetails(task);
  };

  const handleToggleComplete = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTasks = updateTask(taskId, { 
        ...task, 
        completed: !task.completed 
      });
      setTasks(updatedTasks);
    }
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
    setOpenTaskDetails(null);
  };

  const handleDeleteTask = (taskId) => {
    // Implement delete task functionality
    // This would call a deleteTask function from your taskStorage utility
  };

  const handleEditFromPopup = () => {
    setShowTaskDetails(false);
    setTaskToEdit(selectedTask);
    setIsModalOpen(true);
  };

  const handleTaskSave = (taskData) => {
    let updatedTasks;
    
    // Handle rescheduling of recurring task instance
    if (taskToEdit && (taskToEdit.isRecurringInstance || taskToEdit.parentTaskId)) {
      const instanceId = taskToEdit.id;
      const newDate = new Date(taskData.deadline);
      updatedTasks = rescheduleTaskInstance(instanceId, newDate);
    } 
    // Regular task edit or new task
    else if (taskToEdit) {
      updatedTasks = updateTask(taskToEdit.id, taskData);
    } else {
      updatedTasks = addTask(taskData);
    }
    
    setTasks(updatedTasks);
    setIsModalOpen(false);
    setTaskToEdit(null);
  };

  const renderTaskItem = (task, onClick) => {
    const isRecurring = task.isRecurring || task.isRecurringInstance;
    
    return (
      <div
        key={task.id}
        onClick={(e) => onClick(e, task)}
        className={`text-xs p-1.5 rounded mb-1
          ${task.completed 
            ? 'bg-green-500/20 text-green-300 opacity-70' 
            : isRecurring 
              ? 'bg-orange-500/20 text-orange-300 border-l-2 border-orange-500' 
              : 'bg-blue-500/20 text-blue-300'
          }
          hover:bg-opacity-40 cursor-pointer flex items-center gap-1`}
      >
        {task.completed && <span>✓</span>}
        {isRecurring && <span className="text-[9px]">🔄</span>}
        {task.title}
      </div>
    );
  };

  // Helper function to get priority display properties
  const getPriorityDisplay = (priority) => {
    switch (priority) {
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

  // Helper function to get category display properties
  const getCategoryDisplay = (category) => {
    switch (category) {
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

  // Calculate task duration and check if task spans multiple hours
  const getTaskDuration = (task) => {
    const startTime = new Date(task.deadline);
    const endTime = task.endTime ? new Date(task.endTime) : new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour
    
    // Calculate start and end hours including fractional parts
    const startHourExact = startTime.getHours() + (startTime.getMinutes() / 60);
    const endHourExact = endTime.getHours() + (endTime.getMinutes() / 60);
    
    // Round up end hour for display purposes
    const endHourRounded = endTime.getHours() + (endTime.getMinutes() > 0 ? 1 : 0);
    
    // Duration in hours (as a decimal)
    const durationMs = endTime - startTime;
    const durationHours = durationMs / (1000 * 60 * 60);
    
    // Calculate height percentage for a task within an hour block (0-100%)
    const startMinutePercent = (startTime.getMinutes() / 60) * 100;
    const durationPercent = (durationHours > 1) ? 100 : durationHours * 100;
    
    return {
      startHour: startTime.getHours(),
      endHour: endHourRounded,
      startHourExact,
      endHourExact,
      durationHours,
      duration: durationHours,
      startMinutePercent,
      durationPercent,
      spanMultipleHours: durationHours >= 1 || startTime.getHours() !== endTime.getHours()
    };
  };

  return (
    <div className="bg-gray-800/40 backdrop-blur-sm border border-orange-800/30 rounded-2xl overflow-hidden">
      {/* Header with improved styling */}
      <div className="bg-gradient-to-r from-gray-800/80 to-orange-950/30 px-3 py-3 sm:px-4 sm:py-4 border-b border-orange-800/30">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Date Navigation - Improved for mobile */}
          <div className="flex items-center gap-2 w-full justify-between sm:justify-start sm:w-auto sm:gap-3">
            {/* Navigation Buttons - More compact on mobile */}
            <div className="flex items-center gap-1 rounded-lg bg-gray-800/70 p-0.5 sm:p-1 border border-orange-700/30">
              <button
                onClick={() => navigateCalendar(-1)}
                className="p-1 sm:p-1.5 rounded-md text-gray-400 hover:text-orange-400 hover:bg-gray-700/70 transition-colors"
                aria-label="Previous"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm text-gray-300 hover:text-orange-300 transition-colors rounded-md hover:bg-gray-700/70"
              >
                Today
              </button>
              <button
                onClick={() => navigateCalendar(1)}
                className="p-1 sm:p-1.5 rounded-md text-gray-400 hover:text-orange-400 hover:bg-gray-700/70 transition-colors"
                aria-label="Next"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Current Date Display */}
            <h2 className="text-base sm:text-lg font-medium text-white tracking-tight">
              {currentDate.toLocaleString('default', { 
                month: 'long', 
                year: 'numeric',
                ...(view === 'day' && { day: 'numeric' })
              })}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0">
            {/* Time Format Toggle */}
            <button
              onClick={() => setIs24Hour(!is24Hour)}
              className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-lg transition-colors
                bg-gray-800/70 border border-orange-700/30 text-gray-300 
                hover:text-orange-300 hover:bg-gray-700/70 hover:border-orange-600/60"
            >
              {is24Hour ? '24h' : '12h'}
            </button>

            {/* View Toggle - Enhanced */}
            <div className="flex rounded-lg bg-gray-800/70 p-0.5 sm:p-1 border border-orange-700/30">
              {viewOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setView(option.id)}
                  className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-medium rounded-md transition-all duration-200
                    ${view === option.id 
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/10' 
                      : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Views Container */}
      <div className="p-1 sm:p-2 md:p-4">
        {view === 'month' && (
          <div className="overflow-x-auto pb-3">
            <MonthView 
              currentDate={currentDate} 
              tasks={tasks} 
              onDateClick={handleDateClick}
              handleTaskClick={handleTaskClick}
            />
          </div>
        )}
        {view === 'week' && (
          <WeekView 
            currentDate={currentDate} 
            tasks={tasks} 
            formatTime={formatTime}
            onTimeSlotClick={handleDateClick}
            handleTaskClick={handleTaskClick}
            getPriorityDisplay={getPriorityDisplay}
            getCategoryDisplay={getCategoryDisplay}
            getTaskDuration={getTaskDuration}
          />
        )}
        {view === 'day' && (
          <DayView 
            currentDate={currentDate} 
            tasks={tasks} 
            formatTime={formatTime}
            onTimeSlotClick={handleDateClick}
            handleTaskClick={handleTaskClick}
            getPriorityDisplay={getPriorityDisplay}
            getCategoryDisplay={getCategoryDisplay}
            getTaskDuration={getTaskDuration}
          />
        )}
      </div>

      {/* Modals - Task form modal - Updated to use React Portal */}
      {isModalOpen && createPortal(
        <TaskFormModal 
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setTaskToEdit(null);
          }}
          onSave={handleTaskSave}
          taskToEdit={taskToEdit}
          defaultDateTime={selectedDate}
        />,
        document.body
      )}

      {/* Task Details using TaskCard with Portal */}
      {openTaskDetails && createPortal(
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto"
             onClick={() => setOpenTaskDetails(null)}>
          <div className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <TaskCard
              task={openTaskDetails}
              onToggleComplete={() => handleToggleComplete(openTaskDetails.id)}
              onEdit={() => handleEditTask(openTaskDetails)}
              onDelete={() => handleDeleteTask(openTaskDetails.id)}
              usePortal={false}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const MonthView = ({ currentDate, tasks, onDateClick, handleTaskClick }) => {
  // Generate month grid
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  return (
    <div className="grid grid-cols-7 gap-0.5 sm:gap-1.5 min-w-[640px]">
      {/* Weekday headers - More compact on mobile */}
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
        <div key={i} className="p-1 sm:p-2 text-center text-[10px] sm:text-xs font-medium tracking-wider uppercase text-gray-400">
          {day}
        </div>
      ))}
      
      {/* Calendar days - More compact on mobile */}
      {Array.from({ length: 42 }).map((_, index) => {
        const date = new Date(firstDay);
        date.setDate(date.getDate() + index - firstDay.getDay());
        
        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
        const isToday = date.toDateString() === new Date().toDateString();
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        
        // Get tasks for this day
        const dayTasks = tasks.filter(task => {
          const taskDate = new Date(task.deadline);
          return taskDate.toDateString() === date.toDateString();
        });

        const completed = dayTasks.filter(t => t.completed).length;
        const pending = dayTasks.filter(t => !t.completed).length;

        return (
          <div
            key={date.toISOString()}
            onClick={() => onDateClick(date)}
            className={`min-h-[50px] sm:min-h-[80px] md:min-h-[100px] min-w-[90px] p-1 sm:p-2 rounded-lg 
              transition-all duration-150 cursor-pointer relative group
              ${isCurrentMonth 
                ? isWeekend 
                  ? 'bg-gray-800/20' 
                  : 'bg-gray-800/30'  
                : 'bg-gray-800/5 text-gray-600'} 
              ${isToday 
                ? 'ring-1 sm:ring-2 ring-orange-500/50 bg-orange-900/10' 
                : 'hover:bg-gray-700/30 border border-gray-700/30'}`}
          >
            {/* Date Number - Smaller on mobile */}
            <div className="flex justify-between items-center">
              <span className={`inline-block w-5 h-5 sm:w-7 sm:h-7 rounded-full text-center text-[10px] sm:text-sm leading-5 sm:leading-7
                ${isToday 
                  ? 'bg-orange-600 text-white font-medium' 
                  : isCurrentMonth
                    ? 'text-gray-300'
                    : 'text-gray-600'
                }`}>
                {date.getDate()}
              </span>
              
              {/* Task Count Indicator */}
              {(dayTasks.length > 0) && (
                <div className="hidden sm:flex items-center gap-1 text-[10px]">
                  {pending > 0 && (
                    <span className="bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded-full">
                      {pending}
                    </span>
                  )}
                  {completed > 0 && (
                    <span className="bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded-full">
                      {completed}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Tasks List - Simplified for mobile */}
            <div className="mt-1 space-y-0.5 sm:space-y-1 max-h-[60px] sm:max-h-[120px] overflow-y-auto scrollbar-hide">
              {dayTasks.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  onClick={(e) => handleTaskClick(e, task)}
                  className={`p-1 sm:p-1.5 rounded text-[8px] sm:text-xs truncate 
                    ${task.completed 
                      ? 'bg-green-500/10 text-green-300 border-l-2 border-green-500/50' 
                      : 'bg-orange-500/10 text-orange-300 border-l-2 border-orange-500/50'
                    } hover:bg-opacity-30 transition-colors cursor-pointer`}
                >
                  <div className="flex items-center gap-1">
                    <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full flex-shrink-0 
                      ${task.completed ? 'bg-green-400' : 'bg-orange-400'}`}></div>
                    <span className="truncate">{task.title}</span>
                  </div>
                </div>
              ))}
              {dayTasks.length > 3 && (
                <div className="text-[8px] sm:text-xs text-gray-400 text-center">
                  +{dayTasks.length - 3} more
                </div>
              )}
            </div>

            {/* Add Button on Hover */}
            <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDateClick(date);
                }}
                className="p-1 bg-gray-800/80 rounded-full text-orange-400 hover:bg-gray-700"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const WeekView = ({ currentDate, tasks, formatTime, onTimeSlotClick, handleTaskClick, getPriorityDisplay, getCategoryDisplay, getTaskDuration }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());
  const [hourRange, setHourRange] = useState({ start: 7, end: 19 }); // Default 7am-7pm
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const selectedDate = new Date(startOfWeek);
  selectedDate.setDate(startOfWeek.getDate() + selectedDayIndex);

  // Filter hours based on the selected range
  const visibleHours = Array.from(
    { length: 24 }, 
    (_, i) => i
  ).filter(hour => hour >= hourRange.start && hour <= hourRange.end);
  
  // Process tasks for the selected day
  const selectedDayTasks = processTasksForDay(tasks, selectedDate);
  
  // Filter tasks based on visible hours for mobile view
  const visibleTasks = selectedDayTasks.filter(task => {
    return (task.endHour >= hourRange.start && task.startHour <= hourRange.end);
  });

  // Group tasks by their continuous blocks
  const tasksByHour = groupTasksByBlocks(visibleTasks, visibleHours);
  
  return (
    <div className="flex flex-col space-y-2">
      {/* Mobile Week View */}
      <div className="md:hidden flex flex-col">
        {/* Day selector tabs - Google Calendar style */}
        <div className="flex bg-gray-800/70 rounded-lg overflow-hidden mb-2 border border-gray-700/30">
          {Array.from({ length: 7 }).map((_, index) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + index);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = index === selectedDayIndex;
            
            // Format day short name and date
            const dayName = date.toLocaleDateString('default', { weekday: 'short' }).substring(0, 1);
            const dayDate = date.getDate();

            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDayIndex(index)}
                className={`flex-1 flex flex-col items-center py-2 relative
                  ${isSelected 
                    ? 'text-orange-400' 
                    : isToday
                      ? 'text-gray-200'
                      : 'text-gray-400'
                  }`}
              >
                <span className="text-[10px] uppercase font-medium mb-1">{dayName}</span>
                <span className={`w-8 h-8 flex items-center justify-center text-sm rounded-full
                  ${isToday 
                    ? 'bg-orange-500 text-white' 
                    : ''
                  }
                  ${isSelected && !isToday
                    ? 'bg-gray-700 text-orange-400' 
                    : ''
                  }`}>
                  {dayDate}
                </span>
                
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400"></div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Mini Hour Selector - Pills like Google Calendar */}
        <div className="flex justify-between items-center mb-2 px-1">
          <div className="flex gap-1.5 overflow-x-auto py-1 no-scrollbar">
            <button
              onClick={() => setHourRange({ start: 0, end: 23 })}
              className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap
                ${hourRange.start === 0 && hourRange.end === 23 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
            >
              All day
            </button>
            <button
              onClick={() => setHourRange({ start: 9, end: 17 })}
              className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap
                ${hourRange.start === 9 && hourRange.end === 17 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
            >
              Working hours
            </button>
            <button
              onClick={() => setHourRange({ start: 5, end: 11 })}
              className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap
                ${hourRange.start === 5 && hourRange.end === 11 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
            >
              Morning
            </button>
            <button
              onClick={() => setHourRange({ start: 12, end: 17 })}
              className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap
                ${hourRange.start === 12 && hourRange.end === 17
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
            >
              Afternoon
            </button>
          </div>
          
          <button 
            onClick={() => onTimeSlotClick(selectedDate)}
            className="text-white p-1.5 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        
        {/* Timeline View - Google Calendar style */}
        <div className="bg-gray-800/40 rounded-lg border border-gray-700/30">
          {/* Day header - Nice header with date info */}
          <div className="p-3 border-b border-gray-700/50 bg-gray-800/80">
            <h3 className="text-gray-200 font-medium">
              {selectedDate.toLocaleDateString('default', { 
                weekday: 'long', 
                day: 'numeric',
                month: 'long'
              })}
            </h3>
          </div>
          
          {/* Time slots with tasks - FIXED ALIGNMENT TO HOUR LINES */}
          <div className="relative" id="week-calendar-grid">
            {/* Fixed background grid with consistent height */}
            <div className="grid-container">
              {visibleHours.map((hour) => (
                <div 
                  key={hour} 
                  className="flex border-b border-gray-700/20 last:border-b-0"
                  onClick={() => onTimeSlotClick(selectedDate, hour)}
                >
                  {/* Time column - FIXED WIDTH */}
                  <div className={`w-12 flex-shrink-0 py-2 pl-3 pr-1 text-right text-xs font-medium text-gray-500
                    ${hour === Math.min(...visibleHours) ? 'pt-3' : ''}
                    ${hour === Math.max(...visibleHours) ? 'pb-3' : ''}`}
                  >
                    {formatTime(hour).replace(':00', '')}
                  </div>
                  
                  {/* Empty task area with FIXED HEIGHT for consistency */}
                  <div className="flex-1 h-[60px]"></div>
                </div>
              ))}
            </div>
            
            {/* Overlay continuous tasks - CORRECTED POSITIONING */}
            <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
              {(() => {
                const taskGroups = {};
                const hourHeight = 60; // FIXED HEIGHT - each hour cell is exactly 60px
                const firstVisibleHour = Math.min(...visibleHours);
                
                // First group all task segments by task ID
                Object.entries(tasksByHour).forEach(([hour, tasks]) => {
                  tasks.forEach(task => {
                    if (!taskGroups[task.id]) {
                      taskGroups[task.id] = {
                        task: { ...task }
                      };
                    }
                  });
                });
                
                // Calculate positions for each task with PRECISE timing
                return Object.values(taskGroups).map(({ task }) => {
                  const taskStyles = getTaskStyles(task);
                  
                  // Calculate position with PRECISE MEASUREMENTS
                  const hourDiff = task.startHour - firstVisibleHour;
                  const topPosition = (hourDiff * hourHeight) + ((task.startMinutes / 60) * hourHeight);

                  // Calculate vertical offset to align with hour lines
                  const topOffsetPx = 4; // Small correction to align perfectly with hour lines
                  
                  // Calculate precise height based on duration and time
                  const heightValue = task.durationHours * hourHeight;
                  
                  return (
                    <div 
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskClick(e, task);
                      }}
                      style={{
                        position: 'absolute',
                        top: `${topPosition + topOffsetPx}px`, // Added correction to align exactly with hour lines
                        left: '48px', // Time column width margin
                        right: '8px',
                        height: `${Math.max(heightValue - topOffsetPx, 24)}px`, // Adjust height to maintain integrity
                        zIndex: 10
                      }}
                      className={`rounded-md ${taskStyles.bgColor} ${taskStyles.textColor} px-2 flex flex-col justify-center
                        ${task.completed ? 'opacity-60' : ''} pointer-events-auto overflow-hidden`}
                    >
                      <div className="flex items-center gap-1">
                        {task.completed && <span className="text-[10px]">✓</span>}
                        <span className="text-xs font-medium truncate">{task.title}</span>
                      </div>
                      
                      {heightValue > 28 && (
                        <div className="text-[10px] opacity-80">
                          {task.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {task.durationHours >= 0.25 && (
                            <> - {task.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                          )}
                          {task.durationHours >= 0.75 && (
                            <span className="ml-1">({task.durationText})</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
            
          {/* Empty state - No visible hours */}
          {visibleHours.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <p>No hours in selected range</p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Week Grid */}
      <div className="hidden md:flex flex-col overflow-x-auto">
        {/* Week header */}
        <div className="grid grid-cols-8 gap-1">
          <div className="w-20" />
          {Array.from({ length: 7 }).map((_, index) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + index);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={date.toISOString()}
                className={`p-2 text-center border-b border-gray-700/30 
                  ${isToday ? 'bg-orange-500/20 text-orange-300' : ''}`}
              >
                <div className="text-sm font-medium text-gray-400">
                  {date.toLocaleDateString('default', { weekday: 'short' })}
                </div>
                <div className="text-sm text-gray-300">{date.getDate()}</div>
              </div>
            );
          })}
        </div>

        {/* Calendar grid with events */}
        <div className="grid grid-cols-8">
          {/* Time column */}
          <div className="col-span-1">
            {Array.from({ length: 24 }).map((_, hour) => (
              <div key={hour} className="h-[60px] text-sm text-gray-500 text-right pr-2 flex items-center justify-end">
                {formatTime(hour)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {Array.from({ length: 7 }).map((_, dayIndex) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + dayIndex);
            const isToday = date.toDateString() === new Date().toDateString();
            const dayTasks = processTasksForDay(tasks, date);

            return (
              <div key={dayIndex} className="col-span-1 relative">
                {/* Hour cells */}
                {Array.from({ length: 24 }).map((_, hour) => (
                  <div
                    key={hour}
                    onClick={() => onTimeSlotClick(date, hour)}
                    className={`h-[60px] border border-gray-700/30 cursor-pointer
                      ${isToday ? 'bg-gray-800/40' : 'bg-gray-800/20'} hover:bg-gray-700/30`}
                  >
                    <div className="h-full w-full"></div>
                  </div>
                ))}
                
                {/* Task overlays with precise positioning */}
                {dayTasks.map(task => {
                  // Calculate precise position and height
                  const startHour = task.startHour;
                  const startMinute = task.startMinutes;
                  
                  // Position calculations (each hour is 60px tall)
                  // Include minutes in the calculation for precise positioning
                  const top = (startHour * 60) + ((startMinute / 60) * 60);
                  const height = task.durationHours * 60;
                  
                  // Get priority color
                  const priorityColor = task.priority === 'high' 
                    ? 'border-red-500' : task.priority === 'low' 
                      ? 'border-green-500' : 'border-amber-500';
                  
                  return (
                    <div
                      key={task.id}
                      onClick={(e) => handleTaskClick(e, task)}
                      style={{
                        position: 'absolute',
                        top: `${top}px`,
                        height: `${Math.max(height, 20)}px`, // Minimum 20px height
                        left: '1px', // Position inside cell
                        right: '1px',
                        zIndex: 10
                      }}
                      className={`rounded border-l-2 ${priorityColor} p-1.5
                        bg-orange-500/20 hover:bg-orange-500/30 text-orange-300
                        cursor-pointer overflow-hidden text-xs ${task.completed ? 'opacity-50' : ''}`}
                    >
                      <div className="h-full flex flex-col">
                        <div className="font-medium truncate">
                          {task.completed && <span>✓ </span>}
                          {task.title}
                        </div>
                        
                        {/* Show time if there's enough space */}
                        {height > 30 && (
                          <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                            {task.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {height > 40 && (
                              <> - {task.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const DayView = ({ currentDate, tasks, formatTime, onTimeSlotClick, handleTaskClick, getPriorityDisplay, getCategoryDisplay, getTaskDuration }) => {
  const [hourRange, setHourRange] = useState({ start: 7, end: 19 }); // Default 7am-7pm
  
  // Process all day tasks with positioning information
  const allDayTasks = processTasksForDay(tasks, currentDate);
  
  // Filter tasks visible in the current hour range for mobile
  const visibleTasks = allDayTasks.filter(task => {
    return (task.endHour >= hourRange.start && task.startHour <= hourRange.end);
  });

  // Filter hours based on the selected range for mobile
  const visibleHours = Array.from(
    { length: 24 }, 
    (_, i) => i
  ).filter(hour => hour >= hourRange.start && hour <= hourRange.end);

  // Group tasks by their continuous blocks
  const tasksByHour = groupTasksByBlocks(visibleTasks, visibleHours);

  return (
    <div className="flex flex-col space-y-2">
      {/* Mobile Day View */}
      <div className="md:hidden flex flex-col">
        {/* Mini Hour Selector - Pills like Google Calendar */}
        <div className="flex justify-between items-center mb-2 px-1">
          <div className="flex gap-1.5 overflow-x-auto py-1 no-scrollbar">
            <button
              onClick={() => setHourRange({ start: 0, end: 23 })}
              className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap
                ${hourRange.start === 0 && hourRange.end === 23 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
            >
              All day
            </button>
            <button
              onClick={() => setHourRange({ start: 9, end: 17 })}
              className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap
                ${hourRange.start === 9 && hourRange.end === 17 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
            >
              Working hours
            </button>
            <button
              onClick={() => setHourRange({ start: 5, end: 11 })}
              className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap
                ${hourRange.start === 5 && hourRange.end === 11 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
            >
              Morning
            </button>
            <button
              onClick={() => setHourRange({ start: 12, end: 17 })}
              className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap
                ${hourRange.start === 12 && hourRange.end === 17
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
            >
              Afternoon
            </button>
            <button
              onClick={() => setHourRange({ start: 17, end: 23 })}
              className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap
                ${hourRange.start === 17 && hourRange.end === 23
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
            >
              Evening
            </button>
          </div>
          
          <button 
            onClick={() => onTimeSlotClick(currentDate)}
            className="text-white p-1.5 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        
        {/* Timeline View - Google Calendar style */}
        <div className="bg-gray-800/40 rounded-lg border border-gray-700/30">
          {/* Day header - Nice header with date info */}
          <div className="p-3 border-b border-gray-700/50 bg-gray-800/80">
            <h3 className="text-gray-200 font-medium">
              {currentDate.toLocaleDateString('default', { 
                weekday: 'long', 
                day: 'numeric',
                month: 'long'
              })}
            </h3>
            
            {/* Current time indicator if today */}
            {currentDate.toDateString() === new Date().toDateString() && (
              <div className="flex items-center mt-1 text-xs text-orange-400">
                <div className="w-2 h-2 rounded-full bg-orange-500 mr-1.5"></div>
                <span>Current time: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            )}
          </div>
          
          {/* Time slots with tasks - FIXED ALIGNMENT TO HOUR LINES */}
          <div className="relative" id="day-calendar-grid">
            {/* Fixed background grid with consistent height */}
            <div className="grid-container">
              {visibleHours.map((hour) => {
                // Current time indicator calculation
                const isCurrentHour = currentDate.toDateString() === new Date().toDateString() && 
                                    hour === new Date().getHours();
                const currentMinutePercent = isCurrentHour ? (new Date().getMinutes() / 60) * 100 : null;
                
                return (
                  <div 
                    key={hour} 
                    className="flex border-b border-gray-700/20 last:border-b-0 relative"
                    onClick={() => onTimeSlotClick(currentDate, hour)}
                  >
                    {/* Time column */}
                    <div className={`w-12 flex-shrink-0 py-2 pl-3 pr-1 text-right text-xs font-medium text-gray-500
                      ${hour === Math.min(...visibleHours) ? 'pt-3' : ''}
                      ${hour === Math.max(...visibleHours) ? 'pb-3' : ''}`}
                    >
                      {formatTime(hour).replace(':00', '')}
                    </div>
                    
                    {/* Empty task area with FIXED HEIGHT */}
                    <div className="flex-1 h-[60px] relative">
                      {/* Current time indicator */}
                      {isCurrentHour && (
                        <div 
                          className="absolute left-0 right-0 h-0.5 bg-orange-500 z-20"
                          style={{ top: `${currentMinutePercent}%` }}
                        >
                          <div className="absolute left-0 top-1/2 w-2.5 h-2.5 rounded-full bg-orange-500 -translate-x-1/2 -translate-y-1/2"></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Overlay continuous tasks - CORRECTED POSITIONING */}
            <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
              {(() => {
                const taskGroups = {};
                const hourHeight = 60; // FIXED HEIGHT - each hour cell is exactly 60px
                const firstVisibleHour = Math.min(...visibleHours);
                
                // Group tasks by their ID
                Object.entries(tasksByHour).forEach(([hour, tasks]) => {
                  tasks.forEach(task => {
                    if (!taskGroups[task.id]) {
                      taskGroups[task.id] = {
                        task: { ...task }
                      };
                    }
                  });
                });
                
                // Calculate accurate positions for each task
                return Object.values(taskGroups).map(({ task }) => {
                  const taskStyles = getTaskStyles(task);
                  
                  // Calculate position with PRECISE MEASUREMENTS
                  const hourDiff = task.startHour - firstVisibleHour;
                  const topPosition = (hourDiff * hourHeight) + ((task.startMinutes / 60) * hourHeight);
                  
                  // Calculate vertical offset to align with hour lines
                  const topOffsetPx = 4; // Small correction to align perfectly with hour lines
                  
                  // Calculate precise height based on exact duration including minutes
                  const heightValue = task.durationHours * hourHeight;

                  return (
                    <div 
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskClick(e, task);
                      }}
                      style={{
                        position: 'absolute',
                        top: `${topPosition + topOffsetPx}px`, // Added correction to align exactly with hour lines
                        left: '48px', // Time column width margin
                        right: '8px',
                        height: `${Math.max(heightValue - topOffsetPx, 24)}px`, // Adjust height to maintain integrity
                        zIndex: 10
                      }}
                      className={`rounded-md ${taskStyles.bgColor} ${taskStyles.textColor} px-2 flex flex-col justify-center
                        ${task.completed ? 'opacity-60' : ''} pointer-events-auto overflow-hidden`}
                    >
                      <div className="flex items-center gap-1">
                        {task.completed && <span className="text-[10px]">✓</span>}
                        <span className="text-xs font-medium truncate">{task.title}</span>
                      </div>
                      
                      {heightValue > 28 && (
                        <div className="text-[10px] opacity-80">
                          {task.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {task.durationHours >= 0.25 && (
                            <> - {task.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                          )}
                          {task.durationHours >= 0.75 && (
                            <span className="ml-1">({task.durationText})</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
            
          {/* Empty state - No visible hours */}
          {visibleHours.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <p>No hours in selected range</p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Day View */}
      <div className="hidden md:grid grid-cols-[100px_1fr] gap-1">
        {/* Time column */}
        <div className="col-span-1">
          {Array.from({ length: 24 }).map((_, hour) => (
            <div key={hour} className="h-[80px] text-sm text-gray-500 text-right pr-4 flex items-start justify-end pt-2">
              {formatTime(hour)}
            </div>
          ))}
        </div>

        {/* Day column with tasks */}
        <div className="col-span-1 relative">
          {/* Hour cells */}
          {Array.from({ length: 24 }).map((_, hour) => (
            <div
              key={hour}
              onClick={() => onTimeSlotClick(currentDate, hour)}
              className="h-[80px] border border-gray-700/30 hover:bg-gray-700/20 cursor-pointer"
            >
              {/* Hour grid with minute divisions */}
              <div className="h-full">
                <div className="border-b border-gray-700/20 h-[25%]"></div>
                <div className="border-b border-gray-700/20 h-[25%]"></div>
                <div className="border-b border-gray-700/20 h-[25%]"></div>
                <div className="border-b border-gray-700/20 h-[25%]"></div>
              </div>
            </div>
          ))}
          
          {/* Task overlays with precise positioning */}
          {allDayTasks.map(task => {
            // Calculate precise position based on exact time
            const startHour = task.startHour;
            const startMinute = task.startMinutes;
            
            // Position calculations (each hour is 80px tall)
            // Include minutes in the calculation for precise positioning
            const top = (startHour * 80) + ((startMinute / 60) * 80);
            const height = task.durationHours * 80;
            
            // Get priority color
            const priorityColor = task.priority === 'high' 
              ? 'border-red-500' : task.priority === 'low' 
                ? 'border-green-500' : 'border-amber-500';
            
            return (
              <div
                key={task.id}
                onClick={(e) => handleTaskClick(e, task)}
                style={{
                  position: 'absolute',
                  top: `${top}px`,
                  height: `${Math.max(height, 25)}px`, // Minimum 25px height
                  left: '1px', // Position inside cell
                  right: '1px',
                  zIndex: 10
                }}
                className={`rounded border-l-2 ${priorityColor} p-2
                  bg-orange-500/20 hover:bg-orange-500/30 text-orange-300
                  cursor-pointer overflow-hidden ${task.completed ? 'opacity-70' : ''}`}
              >
                <div className="flex flex-col h-full overflow-hidden">
                  <h4 className="text-orange-300 font-medium text-sm truncate flex items-center gap-1.5">
                    {task.completed && <span className="text-green-400">✓</span>}
                    {task.title}
                  </h4>
                  
                  {/* Time information */}
                  {height > 40 && (
                    <div className="text-xs text-gray-400 mt-1">
                      {task.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {task.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      <span className="ml-1">({task.durationText})</span>
                    </div>
                  )}
                  
                  {/* Priority and Category Tags - Show if enough space */}
                  {height > 60 && (
                    <div className="flex mt-2 gap-2 flex-wrap">
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-900/30 text-gray-300">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          task.priority === 'high' ? 'bg-red-400' : 
                          task.priority === 'low' ? 'bg-green-400' : 'bg-amber-400'
                        }`}></span>
                        {task.priority}
                      </span>
                      
                      {task.isRecurring && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full
                          bg-violet-400/10 text-violet-300">
                          🔄
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Show description if there's enough space */}
                  {height > 80 && task.description && (
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Helper function to get styling for tasks based on category/completion status
const getTaskStyles = (task) => {
  if (task.completed) {
    return { 
      bgColor: 'bg-gray-800/70 border border-green-500/30', 
      textColor: 'text-gray-300'
    };
  }
  
  // By category
  switch(task.category) {
    case 'work':
      return { 
        bgColor: 'bg-blue-500/20 border border-blue-500/50', 
        textColor: 'text-blue-200' 
      };
    case 'personal':
      return { 
        bgColor: 'bg-purple-500/20 border border-purple-500/50', 
        textColor: 'text-purple-200' 
      };
    case 'health':
      return { 
        bgColor: 'bg-green-500/20 border border-green-500/50', 
        textColor: 'text-green-200' 
      };
    default:
      return { 
        bgColor: 'bg-orange-500/20 border border-orange-500/50', 
        textColor: 'text-orange-200' 
      };
  }
};

// Group tasks by their continuous blocks to avoid splitting between hours
const groupTasksByBlocks = (tasks, visibleHours) => {
  // First, create a map to track which tasks are displayed in which hours
  const hourTasksMap = {};
  visibleHours.forEach(hour => {
    hourTasksMap[hour] = [];
  });

  // Assign tasks to their respective hours
  tasks.forEach(task => {
    // Only consider tasks that overlap with visible hours
    const startHour = Math.max(task.startHour, Math.min(...visibleHours));
    const endHour = Math.min(task.endHour, Math.max(...visibleHours) + 1);
    
    // Add task to each hour it spans
    for (let h = startHour; h < endHour; h++) {
      if (visibleHours.includes(h)) {
        hourTasksMap[h].push({
          ...task,
          isStartHour: h === task.startHour,
          isEndHour: h === task.endHour - 1,
          displayFull: h === task.startHour // Only show full details on the first hour
        });
      }
    }
  });

  return hourTasksMap;
};

export default CalendarView;
