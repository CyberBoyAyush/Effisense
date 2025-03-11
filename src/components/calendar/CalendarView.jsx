import React, { useState, useEffect } from 'react';
import { getTasks, addTask, updateTask } from '../../utils/taskStorage';
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
    if (taskToEdit) {
      updatedTasks = updateTask(taskToEdit.id, taskData);
    } else {
      updatedTasks = addTask(taskData);
    }
    setTasks(updatedTasks);
    setIsModalOpen(false);
    setTaskToEdit(null);
  };

  return (
    <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-2 sm:p-4 md:p-6 overflow-hidden">
      {/* Redesigned Calendar Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700/30">
          {/* Date and Navigation */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateCalendar(-1)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-colors"
                aria-label="Previous"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => navigateCalendar(1)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-colors"
                aria-label="Next"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <h2 className="text-xl font-semibold text-white">
              {currentDate.toLocaleString('default', { 
                month: 'long', 
                year: 'numeric',
                ...(view === 'day' && { day: 'numeric' })
              })}
            </h2>
          </div>

          {/* Controls Group */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Today Button */}
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white rounded-lg 
                bg-gray-700/50 hover:bg-gray-700 transition-all duration-200
                border border-gray-600/30"
            >
              Today
            </button>

            {/* Time Format Toggle */}
            <button
              onClick={() => setIs24Hour(!is24Hour)}
              className="px-4 py-2 text-sm rounded-lg transition-colors
                bg-gray-700/50 border border-gray-600/30
                text-gray-300 hover:text-white hover:bg-gray-700"
            >
              {is24Hour ? '24h' : '12h'}
            </button>

            {/* View Toggle */}
            <div className="flex rounded-lg bg-gray-700/50 p-1 border border-gray-600/30">
              {viewOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setView(option.id)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all
                    ${view === option.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Views - Updated for mobile */}
      <div className="mt-4 overflow-x-auto">
        {view === 'month' && (
          <MonthView 
            currentDate={currentDate} 
            tasks={tasks} 
            onDateClick={handleDateClick}
            handleTaskClick={handleTaskClick}
          />
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

      {/* Task Form Modal */}
      <TaskFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        defaultDateTime={selectedDate}
      />

      {/* Updated Task Details Popup */}
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
                    <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
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

      {/* Task Form Modal with updated onSave */}
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
    </div>
  );
};

const MonthView = ({ currentDate, tasks, onDateClick, handleTaskClick }) => {
  // Generate month grid
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  return (
    <div className="grid grid-cols-7 gap-1 min-w-[768px] sm:min-w-0">
      {/* Weekday headers */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="p-2 text-center text-sm font-medium text-gray-400">
          {day}
        </div>
      ))}
      
      {/* Calendar days */}
      {Array.from({ length: 42 }).map((_, index) => {
        const date = new Date(firstDay);
        date.setDate(date.getDate() + index - firstDay.getDay());
        
        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
        const isToday = date.toDateString() === new Date().toDateString();
        
        // Get tasks for this day
        const dayTasks = tasks.filter(task => {
          const taskDate = new Date(task.deadline);
          return taskDate.toDateString() === date.toDateString();
        });

        return (
          <div
            key={date.toISOString()}
            onClick={() => onDateClick(date)}
            className={`min-h-[80px] sm:min-h-[100px] p-2 border border-gray-700/30 rounded-lg 
              transition-colors cursor-pointer hover:bg-gray-700/20
              ${isCurrentMonth ? 'bg-gray-800/30' : 'bg-gray-800/10'} 
              ${isToday ? 'border-blue-500/50' : ''}`}
          >
            <div className="text-right">
              <span className={`text-sm ${isCurrentMonth ? 'text-gray-300' : 'text-gray-600'}`}>
                {date.getDate()}
              </span>
            </div>
            {/* Tasks for this day */}
            <div className="mt-1 space-y-1">
              {dayTasks.map(task => (
                <div
                  key={task.id}
                  onClick={(e) => handleTaskClick(e, task)}
                  className={`text-xs p-1 rounded bg-blue-500/20 text-blue-300 truncate 
                    hover:bg-blue-500/30 cursor-pointer flex items-center gap-1
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
  );
};

const WeekView = ({ currentDate, tasks, formatTime, onTimeSlotClick, handleTaskClick }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const selectedDate = new Date(startOfWeek);
  selectedDate.setDate(startOfWeek.getDate() + selectedDayIndex);

  return (
    <div className="flex flex-col space-y-4">
      {/* Mobile Day Selector */}
      <div className="md:hidden">
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
                      ? 'bg-blue-600 text-white'
                      : isToday
                      ? 'bg-blue-500/20 text-blue-300'
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

        {/* Mobile Time Slots */}
        <div className="mt-4 space-y-1">
          {Array.from({ length: 24 }).map((_, hour) => {
            const currentDateTasks = tasks.filter(task => {
              const taskDate = new Date(task.deadline);
              return taskDate.getHours() === hour && 
                     taskDate.toDateString() === selectedDate.toDateString();
            });

            return (
              <div key={hour} className="group">
                <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm py-2 px-4 
                  border-b border-gray-800/50 flex items-center">
                  <span className="text-sm text-gray-400">{formatTime(hour)}</span>
                </div>
                <div 
                  className="min-h-[60px] p-2 hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => onTimeSlotClick(selectedDate, hour)}
                >
                  {currentDateTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={(e) => handleTaskClick(e, task)}
                      className={`p-3 mb-2 rounded-lg bg-blue-500/20 border border-blue-500/20
                        hover:border-blue-500/40 transition-colors ${task.completed ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-blue-300 font-medium flex items-center gap-2">
                          {task.title}
                          {task.completed && <span>✓</span>}
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

      {/* Desktop Week Grid */}
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
                  ${isToday ? 'bg-blue-500/20 text-blue-300' : ''}`}
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
                        className={`text-xs p-1 rounded bg-blue-500/20 text-blue-300 truncate mb-1 
                          hover:bg-blue-500/30 cursor-pointer flex items-center gap-1
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

      {/* Mobile Time Grid */}
      <div className="md:hidden flex flex-col space-y-1">
        {Array.from({ length: 24 }).map((_, hour) => (
          <div
            key={hour}
            className="flex flex-col"
          >
            <div className="sticky left-0 w-full flex items-center py-2 px-4 bg-gray-800/90 backdrop-blur-sm">
              <span className="text-sm text-gray-500">{formatTime(hour)}</span>
            </div>
            <div className="pl-4 space-y-2">
              {tasks
                .filter(task => {
                  const taskDate = new Date(task.deadline);
                  return taskDate.getHours() === hour;
                })
                .map(task => (
                  <div
                    key={task.id}
                    onClick={(e) => handleTaskClick(e, task)}
                    className={`p-2 rounded-lg bg-blue-500/20 border border-blue-500/20
                      hover:border-blue-500/40 transition-colors cursor-pointer
                      ${task.completed ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="text-blue-300 font-medium">
                          {task.title}
                          {task.completed && <span className="ml-2">✓</span>}
                        </h4>
                      </div>
                      <div className="flex flex-col items-end text-xs text-gray-400">
                        <span>{new Date(task.deadline).toLocaleDateString()}</span>
                        <span>{new Date(task.deadline).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DayView = ({ currentDate, tasks, formatTime, onTimeSlotClick, handleTaskClick }) => {
  const dayTasks = tasks.filter(task => {
    const taskDate = new Date(task.deadline);
    return taskDate.toDateString() === currentDate.toDateString();
  });

  return (
    <div className="flex flex-col space-y-2">
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
                  className={`p-2 mb-2 rounded-lg bg-blue-500/20 border border-blue-500/20
                    hover:border-blue-500/40 transition-colors cursor-pointer
                    ${task.completed ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-blue-300 font-medium">
                      {task.title}
                      {task.completed && <span className="ml-2 text-blue-300">✓</span>}
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
  );
};

export default CalendarView;
