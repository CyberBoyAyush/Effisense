import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarDay, FaClock, FaHourglass } from "react-icons/fa";
import { IoTimeOutline, IoCalendarClearOutline } from "react-icons/io5";
import { createTask, updateTask } from '../../utils/database';
import { createGoogleCalendarEvent, updateGoogleCalendarEvent, checkSignedInStatus } from '../../utils/googleCalendar';

// Connection status initialization - ensures we only check once when component loads
// This prevents unnecessary checks on every render
let googleConnectionChecked = false;
let cachedConnectionStatus = false;

const TaskFormModal = ({ isOpen, onClose, onSave, taskToEdit, defaultDateTime }) => {
  // Form fields state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [time, setTime] = useState("12:00");
  const [endTime, setEndTime] = useState("13:00"); // Add end time state
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("pending");
  const [category, setCategory] = useState("work");
  const [syncWithGoogle, setSyncWithGoogle] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState("daily");
  const [enableReminders, setEnableReminders] = useState(false);
  const [reminderTime, setReminderTime] = useState("15");
  const [duration, setDuration] = useState("60"); // Default duration: 60 minutes
  
  // Form validation
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  // Add state for description/notes expanded state and character count
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [charactersLeft, setCharactersLeft] = useState(500);
  const maxNoteLength = 500;

  // Add loading state and animation message state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Funny loading messages
  const funnyLoadingMessages = [
    "Convincing your calendar to accept another task...",
    "Teaching time management to your future self...",
    "Bribing the productivity gods with coffee...",
    "Negotiating with your schedule for some free time...",
    "Finding the perfect spot in your busy day...",
    "Feeding your task to the productivity machine...",
    "Asking AI if this task is really necessary...",
    "Calculating how many coffee breaks you'll need...",
    "Converting procrastination into motivation...",
    "Ensuring your task doesn't feel lonely in your calendar...",
    "Scheduling a meeting between your ambition and reality...",
    "Measuring the task against your willpower reserves...",
    "Checking if your future self will thank you for this...",
    "Calculating the perfect productivity-to-effort ratio..."
  ];

  // AI suggestion for optimal time (mock data - in a real app, this would come from the backend)
  const aiSuggestion = "Tomorrow at 10:00 AM";

  // Add state to track if task is a recurring instance that's being rescheduled
  const [isInstanceReschedule, setIsInstanceReschedule] = useState(false);

  // Convert string deadline to Date object for DatePicker
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // Add state for Google Calendar status
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  // Fast connection check that uses cache when possible
  const checkGoogleCalendarConnection = async () => {
    try {
      if (!isCheckingConnection) {
        setIsCheckingConnection(true);
        
        // Use the cached status if already checked and the modal just reopened
        if (googleConnectionChecked) {
          console.log("Using cached Google Calendar connection status:", cachedConnectionStatus);
          setIsGoogleConnected(cachedConnectionStatus);
          setIsCheckingConnection(false);
          return cachedConnectionStatus;
        }
        
        // Otherwise perform a fresh check
        console.log("Checking Google Calendar connection status...");
        const isConnected = await checkSignedInStatus();
        console.log("Google Calendar connection status:", isConnected);
        
        // Update both the component state and cached values
        setIsGoogleConnected(isConnected);
        cachedConnectionStatus = isConnected;
        googleConnectionChecked = true;
        
        setIsCheckingConnection(false);
        return isConnected;
      }
      return isGoogleConnected;
    } catch (error) {
      console.error("Error checking Google Calendar connection:", error);
      setIsGoogleConnected(false);
      setIsCheckingConnection(false);
      return false;
    }
  };

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      try {
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
            setStartDate(taskDate);
            
            // Handle end time if it exists, otherwise default to 1 hour later
            if (taskToEdit.endTime) {
              const endDateTime = new Date(taskToEdit.endTime);
              setEndTime(endDateTime.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'Asia/Kolkata'
              }));
              setEndDate(endDateTime);
            } else {
              // Default to 1 hour after start time
              const taskEndTime = new Date(taskToEdit.deadline);
              taskEndTime.setHours(taskEndTime.getHours() + 1);
              setEndTime(taskEndTime.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'Asia/Kolkata'
              }));
              setEndDate(taskEndTime);
            }
          }
          
          // Calculate duration if endTime exists
          if (taskToEdit.endTime) {
            const startDate = new Date(taskToEdit.deadline);
            const endDate = new Date(taskToEdit.endTime);
            const durationMs = endDate - startDate;
            const durationMinutes = Math.round(durationMs / (1000 * 60));
            setDuration(durationMinutes.toString());
          } else {
            setDuration("60"); // Default to 60 minutes
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
          setStartDate(date);
          
          // Default end time to 1 hour later
          const endDate = new Date(defaultDateTime);
          endDate.setHours(endDate.getHours() + 1);
          const localEndTime = endDate.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
          });
          setEndTime(localEndTime);
          setEndDate(endDate);
          
          // Reset other fields to defaults
          setPriority("medium");
          setStatus("pending");
          setCategory("work");
          setSyncWithGoogle(false);
          setIsRecurring(false);
          setRecurringType("daily");
          setEnableReminders(false);
          setReminderTime("15");
          setDuration("60"); // Default to 60 minutes
        } else {
          // Set current time as default
          const now = new Date();
          setDeadline(now.toLocaleDateString('en-CA'));
          setTime(now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
          }));
          setStartDate(now);
          
          // Default end time to 1 hour later
          const endDate = new Date(now);
          endDate.setHours(endDate.getHours() + 1);
          setEndTime(endDate.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
          }));
          setEndDate(endDate);
          
          // Reset other fields to defaults
          setPriority("medium");
          setStatus("pending");
          setCategory("work");
          setSyncWithGoogle(false);
          setIsRecurring(false);
          setRecurringType("daily");
          setEnableReminders(false);
          setReminderTime("15");
          setDuration("60"); // Default to 60 minutes
        }

        // Check if this is a recurring task instance being rescheduled
        if (taskToEdit?.isRecurringInstance || taskToEdit?.parentTaskId) {
          setIsInstanceReschedule(true);
        } else {
          setIsInstanceReschedule(false);
        }

        // Ensure we always have valid Date objects
        if (!startDate || isNaN(startDate.getTime())) {
          const now = new Date();
          console.log("Setting default start date:", now);
          setStartDate(now);
        }
        
        if (!endDate || isNaN(endDate.getTime())) {
          const end = startDate ? new Date(startDate.getTime() + 60 * 60 * 1000) : new Date(Date.now() + 60 * 60 * 1000);
          console.log("Setting default end date:", end);
          setEndDate(end);
        }

        // Fast check if Google Calendar is connected using the optimized function
        const initializeGoogleCalendarState = async () => {
          const isConnected = await checkGoogleCalendarConnection();
          
          // If editing a task that has Google sync but Google is no longer connected,
          // show a warning and disable the sync option
          if (taskToEdit?.syncWithGoogle && !isConnected) {
            setErrors({
              ...errors,
              googleCalendar: 'Google Calendar is disconnected. Sync option has been disabled.'
            });
            setSyncWithGoogle(false);
            
            // Clear the error after 5 seconds
            setTimeout(() => {
              setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors.googleCalendar;
                return newErrors;
              });
            }, 5000);
          } else if (taskToEdit?.syncWithGoogle && isConnected) {
            // If editing a task that has Google sync and Google is connected, keep sync enabled
            setSyncWithGoogle(true);
          }
        };
        
        initializeGoogleCalendarState();
      } catch (error) {
        console.error("Error initializing form dates:", error);
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

  // Fix the validateTimeOrder function to properly handle times crossing midnight
  const validateTimeOrder = () => {
    // Use the actual Date objects instead of string parsing
    if (startDate && endDate) {
      // Compare timestamps (which handles day changes correctly)
      if (endDate.getTime() <= startDate.getTime()) {
        setErrors({...errors, endTime: 'End time must be after start time'});
        return false;
      } else {
        const newErrors = {...errors};
        delete newErrors.endTime;
        setErrors(newErrors);
        return true;
      }
    }
    return true;
  };

  // Handle end time change with validation
  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
    setTouched({...touched, endTime: true});
  };

  // Calculate end time based on start time and selected duration
  const calculateEndTime = (startTime, durationMinutes) => {
    if (!startTime) return "";
    
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + parseInt(durationMinutes);
    
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    
    return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
  };

  // Update end time when start time or duration changes
  useEffect(() => {
    if (time && startDate) {
      // Instead of simply setting hours and minutes, calculate from the start time
      // plus the duration in milliseconds to handle crossing days correctly
      const durationMs = parseInt(duration) * 60 * 1000;
      const newEndDate = new Date(startDate.getTime() + durationMs);
      
      setEndDate(newEndDate);
      
      // Update the endTime string representation
      setEndTime(newEndDate.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }));
      
      validateTimeOrder();
    }
  }, [time, duration, startDate]);

  const handleTimeChange = (e) => {
    setTime(e.target.value);
    // End time will be updated by the useEffect
  };

  // Also update the handleDurationChange to handle day crossing properly
  const handleDurationChange = (newDuration) => {
    console.log("Setting duration:", newDuration);
    setDuration(newDuration);
    
    // If we have a start date, calculate new end date
    if (startDate) {
      try {
        const durationMs = parseInt(newDuration) * 60 * 1000;
        // This automatically handles day changes properly
        const newEndDate = new Date(startDate.getTime() + durationMs);
        
        console.log("New end date from duration:", newEndDate);
        setEndDate(newEndDate);
        
        setEndTime(newEndDate.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        }));
        
        // Validate after change (but don't show errors yet)
        validateTimeOrder();
      } catch (error) {
        console.error("Error updating end time from duration:", error);
      }
    }
  };

  const handleStartDateChange = (date) => {
    if (!date) return;
  
    try {
      console.log("Setting start date:", date);
      setStartDate(date);
      
      // Update dependent fields
      setDeadline(date.toISOString().split('T')[0]);
      setTime(date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }));
      
      // If we have a duration, calculate new end time
      if (duration) {
        // Create a new end date based on start date + duration
        const newEndDate = new Date(date.getTime());
        newEndDate.setMinutes(newEndDate.getMinutes() + parseInt(duration));
        setEndDate(newEndDate);
        setEndTime(newEndDate.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        }));
      }
    } catch (error) {
      console.error("Error in handleStartDateChange:", error);
    }
  };

  // Ensure the handleEndDateChange preserves day changes
  const handleEndDateChange = (date) => {
    if (!date) return;
  
    try {
      console.log("Setting end date:", date);
      setEndDate(date);
      
      // Update end time field
      setEndTime(date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }));
      
      // If we have a start date, recalculate duration (even across days)
      if (startDate && date) {
        const durationMs = date.getTime() - startDate.getTime();
        const durationMinutes = Math.max(Math.round(durationMs / (60 * 1000)), 15);
        setDuration(durationMinutes.toString());
      }
      
      validateTimeOrder();
    } catch (error) {
      console.error("Error in handleEndDateChange:", error);
    }
  };

  // Handle description/notes change with character counting
  const handleDescriptionChange = (e) => {
    const input = e.target.value;
    if (input.length <= maxNoteLength) {
      setDescription(input);
      setCharactersLeft(maxNoteLength - input.length);
    }
  };

  // Toggle expanded notes view
  const toggleNotesExpanded = () => {
    setIsNotesExpanded(!isNotesExpanded);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the form
    const isValid = validateForm();
    const isTimeValid = validateTimeOrder();
    
    if (!isValid || !isTimeValid) {
      console.log("Form validation failed");
      return;
    }

    try {
      // Set loading state and random funny message
      setIsSubmitting(true);
      setLoadingMessage(funnyLoadingMessages[Math.floor(Math.random() * funnyLoadingMessages.length)]);

      // Prepare task data while removing system fields
      const taskData = {
        title,
        description,
        deadline: startDate.toISOString(),
        endTime: endDate ? endDate.toISOString() : undefined,
        priority,
        status,
        category,
        // Only include syncWithGoogle if Google Calendar is actually connected
        syncWithGoogle: isGoogleConnected ? syncWithGoogle : false,
        isRecurring,
        recurringType: isRecurring ? recurringType : undefined,
        enableReminders,
        reminderTime: enableReminders ? parseInt(reminderTime, 10) : undefined,
        duration
      };

      // Remove any nullish values
      Object.keys(taskData).forEach(key => {
        if (taskData[key] === undefined || taskData[key] === null) {
          delete taskData[key];
        }
      });

      console.log("Saving task with data:", taskData);
      
      // If editing an existing task, include its ID
      if (taskToEdit) {
        await onSave({...taskData, $id: taskToEdit.$id});
      } else {
        await onSave(taskData);
      }
      
      // The parent component (Tasks.jsx) will handle Google Calendar sync
      
      // Close the modal after successful save
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
      setErrors({...errors, general: "Failed to save task"});
    } finally {
      setIsSubmitting(false);
    }
  };

  // Apply AI suggestion
  const applyAiSuggestion = () => {
    // In a real app, this would parse the AI suggestion and set the date and time
    // For now, using mock data
    setDeadline("2023-10-12");
    setTime("10:00");
  };

  // Modify the Google Calendar Sync Toggle to show connection status
  const renderGoogleSyncToggle = () => (
    <div className="flex items-center h-full">
      <label className={`inline-flex items-center ${isGoogleConnected ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}>
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={syncWithGoogle}
          onChange={() => {
            if (!isGoogleConnected) {
              setErrors({
                ...errors, 
                googleCalendar: 'Please connect to Google Calendar in Settings first.'
              });
              
              // Clear the error after 3 seconds
              setTimeout(() => {
                setErrors(prev => {
                  const newErrors = {...prev};
                  delete newErrors.googleCalendar;
                  return newErrors;
                });
              }, 3000);
              
              // Don't allow enabling when not connected
              setSyncWithGoogle(false);
              return;
            }
            setSyncWithGoogle(!syncWithGoogle);
          }}
          disabled={!isGoogleConnected}
        />
        <div className={`relative w-8 h-4 ${isGoogleConnected ? 'bg-gray-700' : 'bg-gray-800'} rounded-full 
          peer peer-checked:bg-orange-600 peer-focus:ring-1 peer-focus:ring-orange-500/30
          after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
          after:rounded-full after:h-3 after:w-3 after:transition-all 
          peer-checked:after:translate-x-4`}></div>
        <span className="ml-2 text-xs text-gray-300">
          Google Sync
        </span>
        {!isGoogleConnected && (
          <span className="ml-1 text-[10px] text-orange-400">(Setup in Settings)</span>
        )}
        {isCheckingConnection && (
          <span className="ml-1 text-[10px] text-blue-400 animate-pulse">(Checking...)</span>
        )}
      </label>
    </div>
  );

  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-[100] bg-gray-900/80 backdrop-blur-sm flex items-center justify-center touch-none overflow-y-auto py-1 sm:py-4 px-1 sm:px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ isolation: 'isolate' }}
    >
      {/* More compact modal container */}
      <div 
        className="w-full sm:w-[90%] max-w-lg mx-auto my-auto bg-gray-800 rounded-xl shadow-xl
          flex flex-col border border-orange-700/30 transform-gpu relative"
        style={{
          maxHeight: 'calc(100vh - 1rem)',
          margin: 'auto'
        }}
      >
        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-10 rounded-xl flex flex-col items-center justify-center">
            <div className="w-16 h-16 mb-4">
              <svg className="animate-spin w-full h-full text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="text-orange-400 text-center font-medium mb-3">
              {taskToEdit ? "Updating task..." : "Creating task..."}
            </div>
            <div className="text-gray-300 text-sm text-center max-w-[80%]">
              {loadingMessage}
            </div>
          </div>
        )}
        
        {/* Compact header */}
        <div className="p-2 sm:p-3 bg-gradient-to-r from-gray-800/80 to-orange-950/20 border-b border-orange-700/30 flex items-center justify-between shrink-0">
          <h2 className="text-sm sm:text-base font-semibold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
            {taskToEdit 
              ? isInstanceReschedule 
                ? "Reschedule Task" 
                : "Edit Task" 
              : "Add New Task"
            }
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-700/50 text-gray-400 hover:text-orange-300 transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Info about recurring task - more compact */}
        {isInstanceReschedule && (
          <div className="px-3 py-1.5 bg-orange-500/10 border-b border-orange-500/20">
            <p className="text-orange-300 text-xs flex items-center gap-1">
              <span className="text-xs">🔄</span>
              <span>This is a recurring task. Your changes will create a new instance.</span>
            </p>
          </div>
        )}

        {/* Google Calendar error message */}
        {errors.googleCalendar && (
          <div className="px-3 py-1.5 bg-red-500/10 border-b border-red-500/20">
            <p className="text-red-300 text-xs flex items-center gap-1">
              <span className="text-xs">⚠️</span>
              <span>{errors.googleCalendar}</span>
            </p>
          </div>
        )}

        {/* More compact scrollable form with reduced spacing */}
        <div className="overflow-y-auto flex-grow px-2 sm:px-3 py-2 sm:py-3">
          <form id="taskForm" onSubmit={handleSubmit} className="space-y-3">
            {/* Title Field - More compact */}
            <div>
              <label htmlFor="title" className="text-gray-300 text-xs font-medium block mb-0.5">
                Title <span className="text-orange-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="Enter task title"
                className={`w-full p-2 bg-gray-900/50 border rounded-md
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
                <p className="text-red-500 text-xs mt-0.5">{errors.title}</p>
              )}
            </div>

            {/* Description Field - Enhanced as Notes Section */}
            <div className="bg-gray-900/30 border border-gray-700/50 rounded-lg p-2 transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="description" className="text-gray-300 text-xs font-medium flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Notes</span>
                </label>
                <button 
                  type="button"
                  onClick={toggleNotesExpanded}
                  className="text-xs text-gray-400 hover:text-orange-400 transition-colors"
                >
                  {isNotesExpanded ? 'Collapse' : 'Expand'}
                </button>
              </div>
              
              <textarea
                id="description"
                placeholder="Add notes, details or instructions for this task... 
• What needs to be done?
• Any specific requirements?
• References or resources needed?"
                className={`w-full p-2 bg-gray-900/60 border border-gray-700/60 rounded-md
                  text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1
                  focus:ring-orange-500 focus:border-transparent transition-all
                  ${isNotesExpanded ? 'min-h-[120px]' : 'min-h-[60px]'}`}
                value={description}
                onChange={handleDescriptionChange}
                maxLength={maxNoteLength}
                style={{
                  resize: isNotesExpanded ? 'vertical' : 'none',
                }}
              />
              
              <div className="flex items-center justify-between mt-1.5 text-[10px] text-gray-400">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                  <span>Include relevant context to help you later</span>
                </div>
                <div className={`transition-colors ${charactersLeft < 50 ? 'text-orange-400' : ''}`}>
                  {charactersLeft} characters left
                </div>
              </div>
            </div>

            {/* Priority and Status + Category section in more compact 2-col grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {/* Priority Dropdown */}
              <div>
                <label htmlFor="priority" className="text-gray-300 text-xs font-medium block mb-0.5">
                  Priority
                </label>
                <select
                  id="priority"
                  className="w-full p-1.5 bg-gray-900/50 border border-gray-700 rounded-md
                    text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none text-sm"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f97316'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
                    backgroundRepeat: 'no-repeat', 
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1em 1em',
                    paddingRight: '2rem'
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Status Dropdown */}
              <div>
                <label htmlFor="status" className="text-gray-300 text-xs font-medium block mb-0.5">
                  Status
                </label>
                <select
                  id="status"
                  className="w-full p-1.5 bg-gray-900/50 border border-gray-700 rounded-md
                    text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none text-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f97316'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
                    backgroundRepeat: 'no-repeat', 
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1em 1em',
                    paddingRight: '2rem'
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Category Dropdown */}
              <div>
                <label htmlFor="category" className="text-gray-300 text-xs font-medium block mb-0.5">
                  Category
                </label>
                <select
                  id="category"
                  className="w-full p-1.5 bg-gray-900/50 border border-gray-700 rounded-md
                    text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f97316'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
                    backgroundRepeat: 'no-repeat', 
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1em 1em',
                    paddingRight: '2rem'
                  }}
                >
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="health">Health</option>
                </select>
              </div>

              {/* Google Calendar Sync Toggle - Updated with connection status */}
              {renderGoogleSyncToggle()}
            </div>

            {/* Enhanced Date and Time Pickers - More compact */}
            <div className="bg-gray-900/40 rounded-lg border border-gray-700/50 p-2 sm:p-3 space-y-3">
              <div className="flex items-center gap-2 text-orange-400 mb-0.5">
                <IoCalendarClearOutline className="text-sm" />
                <h3 className="text-xs font-medium">Schedule</h3>
              </div>
              
              {/* Compact 2-column layout for date/time selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Date Picker */}
                <div>
                  <label className="text-gray-300 text-xs font-medium flex items-center gap-1 mb-1">
                    <span>Date</span> 
                    <span className="text-orange-500">*</span>
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={handleStartDateChange}
                    dateFormat="MMM d, yyyy"
                    className="w-full p-1.5 sm:p-2.5 bg-gray-900/50 border border-gray-700/60 rounded-md
                      text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500
                      hover:border-gray-600 transition-colors text-sm sm:text-base"
                    calendarClassName="dark-calendar"
                    wrapperClassName="w-full"
                  />
                </div>
                
                {/* Start Time inline with Date */}
                <div>
                  <label className="text-gray-300 text-xs font-medium flex items-center gap-1 mb-1">
                    <IoTimeOutline className="text-orange-400 text-xs" />
                    <span>Start Time</span>
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={handleStartDateChange}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="w-full p-1.5 sm:p-2.5 bg-gray-900/50 border border-gray-700/60 rounded-md
                      text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500
                      hover:border-gray-600 transition-colors text-sm sm:text-base"
                    calendarClassName="dark-calendar"
                    wrapperClassName="w-full"
                  />
                </div>
              </div>
              
              {/* Compact Duration and End Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Duration Quick Select - Fix for desktop view */}
                <div>
                  <label className="text-gray-300 text-xs font-medium flex items-center gap-1 mb-1">
                    <FaHourglass className="text-orange-400 text-xs" />
                    <span>Duration</span>
                  </label>
                  <div className="flex flex-nowrap gap-1 sm:gap-2 overflow-x-auto sm:flex-wrap sm:overflow-x-visible pb-1 sm:pb-0 -mx-1 px-1 scrollbar-hide">
                    {[
                      { value: "15", label: "15m" },
                      { value: "30", label: "30m" },
                      { value: "45", label: "45m" },
                      { value: "60", label: "1h" },
                      { value: "90", label: "1.5h" },
                      { value: "120", label: "2h" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleDurationChange(option.value)}
                        className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md text-xs sm:text-sm shrink-0 sm:flex-1 transition-all
                          ${duration === option.value
                            ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm' 
                            : 'bg-gray-800/70 text-gray-400 hover:bg-gray-700 border border-gray-700/40'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* End Time */}
                <div>
                  <label className="text-gray-300 text-xs font-medium block mb-1">
                    End Time
                  </label>
                  <DatePicker
                    selected={endDate}
                    onChange={handleEndDateChange}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className={`w-full p-1.5 sm:p-2.5 bg-gray-900/50 border rounded-md
                      text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500
                      ${touched.endTime && errors.endTime ? 'border-red-500' : 'border-gray-700/60'}
                      hover:border-gray-600 transition-colors text-sm sm:text-base`}
                    calendarClassName="dark-calendar"
                    wrapperClassName="w-full"
                  />
                  {touched.endTime && errors.endTime && (
                    <p className="text-red-500 text-xs mt-0.5">{errors.endTime}</p>
                  )}
                </div>
              </div>
              
              {/* Compact Tips - Combined with AI suggestion */}
              <div className="flex items-center bg-gray-800/40 rounded-md p-2 border border-gray-700/30">
                <div className="flex items-center text-xs text-gray-400">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-1.5"></span>
                  <span>Click a duration to set end time</span>
                </div>
              </div>
            </div>

            {/* AI Suggestion - More compact */}
            <div className="bg-gray-900/40 p-2 rounded-md border border-orange-500/20 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-orange-400 text-xs">🤖</span>
                <span className="text-xs text-gray-300">{aiSuggestion}</span>
              </div>
              <button
                type="button"
                onClick={applyAiSuggestion}
                className="text-[10px] bg-orange-600/20 text-orange-400 px-1.5 py-0.5 rounded
                  hover:bg-orange-600/30 transition-colors"
              >
                Apply
              </button>
            </div>

            {/* Toggle Accordion for Advanced Settings */}
            <div className="border-t border-gray-700/50 pt-2">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-medium text-gray-300">Advanced Settings</span>
                  <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                
                <div className="mt-2 space-y-3">
                  {/* Recurring Task Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isRecurring}
                        onChange={() => setIsRecurring(!isRecurring)}
                      />
                      <div className="relative w-8 h-4 bg-gray-700 rounded-full peer peer-checked:bg-orange-600 
                        peer-focus:ring-1 peer-focus:ring-orange-500/30
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                        after:rounded-full after:h-3 after:w-3 after:transition-all 
                        peer-checked:after:translate-x-4"></div>
                      <span className="ml-2 text-xs font-medium text-gray-300">
                        Recurring Task
                      </span>
                    </label>
                  </div>

                  {isRecurring && (
                    <div className="bg-gray-800/50 p-2 rounded-md mt-1">
                      <label htmlFor="recurringType" className="text-gray-300 text-xs font-medium block mb-1">
                        Repeat
                      </label>
                      <select
                        id="recurringType"
                        className="w-full p-1.5 bg-gray-900/50 border border-gray-700 rounded-md
                          text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none text-sm"
                        value={recurringType}
                        onChange={(e) => setRecurringType(e.target.value)}
                        style={{ 
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f97316'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
                          backgroundRepeat: 'no-repeat', 
                          backgroundPosition: 'right 0.5rem center',
                          backgroundSize: '1em 1em',
                          paddingRight: '2rem'
                        }}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  )}

                  {/* Reminder Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={enableReminders}
                        onChange={() => setEnableReminders(!enableReminders)}
                      />
                      <div className="relative w-8 h-4 bg-gray-700 rounded-full peer peer-checked:bg-orange-600 
                        peer-focus:ring-1 peer-focus:ring-orange-500/30
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                        after:rounded-full after:h-3 after:w-3 after:transition-all 
                        peer-checked:after:translate-x-4"></div>
                      <span className="ml-2 text-xs font-medium text-gray-300">
                        Enable Reminders
                      </span>
                    </label>
                  </div>

                  {enableReminders && (
                    <div className="bg-gray-800/50 p-2 rounded-md mt-1">
                      <label htmlFor="reminderTime" className="text-gray-300 text-xs font-medium block mb-1">
                        Remind me before
                      </label>
                      <select
                        id="reminderTime"
                        className="w-full p-1.5 bg-gray-900/50 border border-gray-700 rounded-md
                          text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none text-sm"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        style={{ 
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f97316'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
                          backgroundRepeat: 'no-repeat', 
                          backgroundPosition: 'right 0.5rem center',
                          backgroundSize: '1em 1em',
                          paddingRight: '2rem'
                        }}
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
              </details>
            </div>
          </form>
        </div>

        {/* Footer with action buttons - More compact */}
        <div className="border-t border-orange-700/30 p-2 bg-gray-800/90 shrink-0">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-1.5 bg-gray-700 text-gray-300 rounded-md 
                hover:bg-gray-600 transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="taskForm"
              className="flex-1 px-3 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-md 
                hover:from-orange-500 hover:to-amber-500 transition-colors font-medium text-xs
                shadow-[0_0_8px_rgba(251,146,60,0.3)] hover:shadow-[0_0_12px_rgba(251,146,60,0.4)]"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-xs">{loadingMessage}</span>
                </div>
              ) : (
                taskToEdit 
                  ? isInstanceReschedule 
                    ? "Reschedule" 
                    : "Update" 
                  : "Add"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFormModal;