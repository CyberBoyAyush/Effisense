import React from "react";
import CalendarView from "../components/calendar/CalendarView";
import { FaCalendarAlt, FaRegCalendarCheck } from "react-icons/fa";

const Calendar = () => {
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

      <CalendarView />
    </div>
  );
};

export default Calendar;