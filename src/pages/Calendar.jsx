import React from "react";
import CalendarView from "../components/calendar/CalendarView";

const Calendar = () => {
  return (
    <div className="p-4 md:p-6 text-gray-200">
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-4 md:p-8 rounded-2xl backdrop-blur-sm border border-gray-700/50 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <span>📅</span>
          <span>Calendar</span>
        </h1>
        <p className="text-sm md:text-base text-gray-400 mt-2">View and manage your schedule</p>
      </div>

      <CalendarView />
    </div>
  );
};

export default Calendar;