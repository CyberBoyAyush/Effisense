import React, { useState, useEffect } from 'react';
import { getTasks, addTask, updateTask, rescheduleTaskInstance } from '../../utils/taskStorage';
import TaskFormModal from '../tasks/TaskFormModal';

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

  useEffect(() => {
    const loadedTasks = getTasks();
    setTasks(loadedTasks);
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
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleToggleComplete = (e, taskId) => {
    e.stopPropagation();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTasks = updateTask(taskId, { 
        ...task, 
        completed: !task.completed 
      });
      setTasks(updatedTasks);
      // Update selectedTask if in popup
      if (selectedTask?.id === taskId) {
        setSelectedTask({ ...task, completed: !task.completed });
      }
    }
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
          />
        )}
        {view === 'day' && (
          <DayView 
            currentDate={currentDate} 
            tasks={tasks} 
            formatTime={formatTime}
            onTimeSlotClick={handleDateClick}
            handleTaskClick={handleTaskClick}
          />
        )}
      </div>

      {/* Modals - keep as is */}
      <TaskFormModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleTaskSave}
        taskToEdit={taskToEdit}
        defaultDateTime={selectedDate}
      />

      {/* Task Details Modal - keep as is */}
      {showTaskDetails && selectedTask && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/90 rounded-2xl max-w-lg w-full border border-gray-700/50 overflow-hidden">
            {/* Popup Header */}
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  {/* Checkbox Toggle */}
                  <button
                    onClick={(e) => handleToggleComplete(e, selectedTask.id)}
                    className={`flex items-center justify-center w-6 h-6 rounded border-2 transition-all duration-200 
                      ${selectedTask.completed 
                        ? 'bg-blue-500 border-blue-600 text-white' 
                        : 'border-gray-600 hover:border-blue-500'}`}
                  >
                    {selectedTask.completed && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {selectedTask.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Due: {new Date(selectedTask.deadline).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTaskDetails(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 011.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 010-1.414z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Popup Body */}
            <div className="p-6">
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-wrap">{selectedTask.description}</p>
              </div>
            </div>

            {/* Updated Popup Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700/50 bg-gray-800/50">
              <button
                onClick={handleEditFromPopup}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Edit Task
              </button>
            </div>
          </div>
        </div>
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

const WeekView = ({ currentDate, tasks, formatTime, onTimeSlotClick, handleTaskClick }) => {
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

  return (
    <div className="flex flex-col space-y-2">
      {/* Mobile Day Selector */}
      <div className="md:hidden">
        {/* Day selector - keep as is */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
          {Array.from({ length: 7 }).map((_, index) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + index);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = index === selectedDayIndex;

            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDayIndex(index)}
                className={`flex flex-col items-center p-3 rounded-xl min-w-[80px]
                  transition-all duration-200 ${
                    isSelected
                      ? 'bg-orange-600 text-white'
                      : isToday
                      ? 'bg-orange-500/20 text-orange-300'
                      : 'text-gray-400 hover:bg-gray-700/30'
                  }`}
              >
                <span className="text-sm font-medium">
                  {date.toLocaleDateString('default', { weekday: 'short' })}
                </span>
                <span className="text-lg mt-1">{date.getDate()}</span>
              </button>
            );
          })}
        </div>

        {/* Hour Range Selector for Mobile */}
        <div className="bg-gray-800/50 rounded-lg p-3 mt-3 border border-gray-700/30">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-300">Hours</h3>
            <button 
              onClick={() => setHourRange({ start: 0, end: 23 })}
              className="text-xs text-orange-400 px-2 py-1 rounded hover:bg-gray-700/50"
            >
              Show All
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto py-1">
            <HourRangeButton 
              label="Morning" 
              range={{ start: 5, end: 11 }} 
              setRange={setHourRange} 
              current={hourRange}
            />
            <HourRangeButton 
              label="Afternoon" 
              range={{ start: 12, end: 16 }} 
              setRange={setHourRange} 
              current={hourRange}
            />
            <HourRangeButton 
              label="Evening" 
              range={{ start: 17, end: 23 }}
              setRange={setHourRange}
              current={hourRange}
            />
            <HourRangeButton 
              label="Work Hours" 
              range={{ start: 9, end: 17 }}
              setRange={setHourRange}
              current={hourRange}
            />
          </div>
        </div>

        {/* Mobile Time Slots - More compact */}
        <div className="mt-4">
          {visibleHours.map((hour) => {
            const currentDateTasks = tasks.filter(task => {
              const taskDate = new Date(task.deadline);
              return taskDate.getHours() === hour && 
                    taskDate.toDateString() === selectedDate.toDateString();
            });

            // Skip rendering empty time slots when there are no tasks
            if (currentDateTasks.length === 0) {
              return (
                <div 
                  key={hour} 
                  className="flex items-center p-2 border-b border-gray-700/20 hover:bg-gray-800/30"
                  onClick={() => onTimeSlotClick(selectedDate, hour)}
                >
                  <span className="text-sm text-gray-500 w-14">{formatTime(hour)}</span>
                  <span className="text-xs text-gray-500 pl-2">+ Add task</span>
                </div>
              );
            }

            return (
              <div key={hour} className="mb-2">
                {/* Time Header - More compact */}
                <div className="flex items-center py-1.5 px-3 bg-gray-800/70 rounded-t-lg">
                  <span className="text-sm font-medium text-gray-300">{formatTime(hour)}</span>
                  <button
                    onClick={() => onTimeSlotClick(selectedDate, hour)}
                    className="ml-auto text-xs text-orange-400 p-1"
                  >
                    +
                  </button>
                </div>
                
                {/* Tasks for this hour */}
                <div className="space-y-1 p-1">
                  {currentDateTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={(e) => handleTaskClick(e, task)}
                      className={`p-2 rounded-lg bg-orange-500/20 border border-orange-500/20
                        hover:border-orange-500/40 transition-colors ${task.completed ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm text-orange-300 font-medium truncate flex-1">
                          {task.title}
                          {task.completed && <span className="ml-1">✓</span>}
                        </h4>
                        <span className="text-xs text-gray-400 ml-2">
                          {new Date(task.deadline).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop Week Grid - Keep as is */}
      <div className="hidden md:flex flex-col space-y-2 overflow-x-auto">
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

        {/* Time Grid */}
        {Array.from({ length: 24 }).map((_, hour) => (
          <div key={hour} className="grid grid-cols-8 gap-1 min-h-[60px]">
            <div className="w-20 text-sm text-gray-500 text-right pr-2">
              {formatTime(hour)}
            </div>
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const date = new Date(startOfWeek);
              date.setDate(startOfWeek.getDate() + dayIndex);
              const isToday = date.toDateString() === new Date().toDateString();

              const dayHourTasks = tasks.filter(task => {
                const taskDate = new Date(task.deadline);
                return taskDate.getHours() === hour && taskDate.toDateString() === date.toDateString();
              });

              return (
                <div
                  key={`${date.toISOString()}-${hour}`}
                  onClick={() => onTimeSlotClick(date, hour)}
                  className="cursor-pointer hover:bg-gray-700/20"
                >
                  <div
                    className={`border border-gray-700/30 rounded-lg p-1 ${
                      isToday ? 'bg-gray-800/40' : 'bg-gray-800/20'
                    }`}
                  >
                    {dayHourTasks.map(task => (
                      <div
                        key={task.id}
                        onClick={(e) => handleTaskClick(e, task)}
                        className={`text-xs p-1 rounded bg-orange-500/20 text-orange-300 truncate mb-1 
                          hover:bg-orange-500/30 cursor-pointer flex items-center gap-1
                          ${task.completed ? 'opacity-50' : ''}`}
                        title={task.title}
                      >
                        {task.completed && <span>✓</span>}
                        {task.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
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

const DayView = ({ currentDate, tasks, formatTime, onTimeSlotClick, handleTaskClick }) => {
  const [hourRange, setHourRange] = useState({ start: 7, end: 19 }); // Default 7am-7pm
  
  const dayTasks = tasks.filter(task => {
    const taskDate = new Date(task.deadline);
    return taskDate.toDateString() === currentDate.toDateString();
  });

  // Filter hours based on the selected range for mobile
  const visibleHours = Array.from(
    { length: 24 }, 
    (_, i) => i
  ).filter(hour => hour >= hourRange.start && hour <= hourRange.end);

  return (
    <div className="flex flex-col space-y-2">
      {/* Mobile Hour Range Selector */}
      <div className="md:hidden bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-300">Hours</h3>
          <button 
            onClick={() => setHourRange({ start: 0, end: 23 })}
            className="text-xs text-orange-400 px-2 py-1 rounded hover:bg-gray-700/50"
          >
            Show All
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto py-1">
          <HourRangeButton 
            label="Morning" 
            range={{ start: 5, end: 11 }} 
            setRange={setHourRange} 
            current={hourRange}
          />
          <HourRangeButton 
            label="Afternoon" 
            range={{ start: 12, end: 16 }} 
            setRange={setHourRange} 
            current={hourRange}
          />
          <HourRangeButton 
            label="Evening" 
            range={{ start: 17, end: 23 }} 
            setRange={setHourRange}
            current={hourRange}
          />
          <HourRangeButton 
            label="Work Hours" 
            range={{ start: 9, end: 17 }}
            setRange={setHourRange}
            current={hourRange}
          />
        </div>
      </div>

      {/* Mobile Day View - Compact Layout */}
      <div className="md:hidden">
        {visibleHours.map((hour) => {
          const hourTasks = dayTasks.filter(task => {
            const taskDate = new Date(task.deadline);
            return taskDate.getHours() === hour;
          });

          // Skip rendering empty time slots
          if (hourTasks.length === 0) {
            return (
              <div 
                key={hour} 
                className="flex items-center p-2 border-b border-gray-700/20 hover:bg-gray-800/30"
                onClick={() => onTimeSlotClick(currentDate, hour)}
              >
                <span className="text-sm text-gray-500 w-14">{formatTime(hour)}</span>
                <span className="text-xs text-gray-500 pl-2">+ Add task</span>
              </div>
            );
          }

          return (
            <div key={hour} className="mb-2">
              <div className="flex items-center py-1.5 px-3 bg-gray-800/70 rounded-t-lg">
                <span className="text-sm font-medium text-gray-300">{formatTime(hour)}</span>
                <button
                  onClick={() => onTimeSlotClick(currentDate, hour)}
                  className="ml-auto text-xs text-orange-400 p-1"
                >
                  +
                </button>
              </div>
              
              <div className="space-y-1 p-1">
                {hourTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={(e) => handleTaskClick(e, task)}
                    className={`p-2 rounded-lg bg-orange-500/20 border border-orange-500/20
                      hover:border-orange-500/40 transition-colors ${task.completed ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm text-orange-300 font-medium truncate flex-1">
                        {task.title}
                        {task.completed && <span className="ml-1">✓</span>}
                      </h4>
                      <span className="text-xs text-gray-400 ml-2">
                        {new Date(task.deadline).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Day View - Keep as is */}
      <div className="hidden md:flex flex-col space-y-2">
        {Array.from({ length: 24 }).map((_, hour) => {
          const hourTasks = dayTasks.filter(task => {
            const taskDate = new Date(task.deadline);
            return taskDate.getHours() === hour;
          });

          return (
            <div
              key={hour}
              className="flex cursor-pointer hover:bg-gray-700/20 rounded-lg"
            >
              <div className="w-24 text-sm text-gray-500 p-4 flex-shrink-0">
                {formatTime(hour)}
              </div>
              <div 
                className="flex-1 min-h-[80px] p-4 border-l border-gray-700/50"
                onClick={() => onTimeSlotClick(currentDate, hour)}
              >
                {hourTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={(e) => handleTaskClick(e, task)}
                    className={`p-2 mb-2 rounded-lg bg-orange-500/20 border border-orange-500/20
                      hover:border-orange-500/40 transition-colors cursor-pointer
                      ${task.completed ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-orange-300 font-medium">
                        {task.title}
                        {task.completed && <span className="ml-2 text-orange-300">✓</span>}
                      </h4>
                      <span className="text-sm text-gray-400">
                        {new Date(task.deadline).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
