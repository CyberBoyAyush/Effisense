import React, { useState, useEffect } from "react";
import CalendarView from "../components/calendar/CalendarView";
import { FaCalendarAlt, FaRegCalendarCheck, FaExclamationTriangle } from "react-icons/fa";
import { checkSignedInStatus } from "../utils/googleCalendar";
import { BiInfoCircle } from "react-icons/bi";

const Calendar = () => {
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [showWarning, setShowWarning] = useState(true);

  // Check Google Calendar connection status
  useEffect(() => {
    const checkGoogleStatus = async () => {
      try {
        const isConnected = await checkSignedInStatus();
        setIsGoogleConnected(isConnected);
        console.log("Google Calendar connection status:", isConnected ? "Connected" : "Not connected");
      } catch (error) {
        console.error("Error checking Google Calendar connection:", error);
        setIsGoogleConnected(false);
      }
    };
    
    checkGoogleStatus();
  }, []);

  return (
    <div className="p-4 md:p-6 text-gray-200">
      {/* Header - Enhanced orange theme with React Icons */}
      <div className="bg-gradient-to-r from-gray-800/50 to-orange-900/30 p-4 md:p-8 rounded-2xl backdrop-blur-sm border border-orange-800/30 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent flex items-center gap-3">
          <FaCalendarAlt className="text-orange-400" />
          <span>Calendar</span>
        </h1>
        <p className="text-sm md:text-base text-gray-400 mt-2 flex items-center gap-2">
          <FaRegCalendarCheck className="text-orange-400/70" />
          <span>View and manage your schedule</span>
        </p>
      </div>

      {/* Compact Experimental Feature Warning */}
      {showWarning && (
        <div className="mb-4">
          <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/20 border border-amber-500/30 
                         rounded-lg p-3 shadow-md flex items-center gap-3">
            {/* Icon */}
            <div className="flex-shrink-0">
              <FaExclamationTriangle size={18} className="text-amber-400" />
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm text-amber-100/90">
                  <span className="font-medium text-amber-300">Beta feature:</span>
                  {" "}Connect with Google Calendar for the best experience.
                </p>
              </div>
            </div>
            
            {/* Dismiss button */}
            <button 
              className="ml-2 text-amber-400/70 hover:text-amber-300 p-1 rounded-full hover:bg-amber-800/30 transition-colors"
              onClick={() => setShowWarning(false)}
              aria-label="Dismiss"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <CalendarView isGoogleConnected={isGoogleConnected} />
    </div>
  );
};

export default Calendar;