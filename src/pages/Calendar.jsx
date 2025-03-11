import React from "react";

const Calendar = () => {
  return (
    <div className="p-6 text-gray-200">
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-700/50">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span>📅</span>
          <span>Calendar</span>
        </h1>
        <p className="text-gray-400 mt-2">Manage your schedule and events</p>
      </div>

      <div className="mt-8 grid gap-6">
        {/* Calendar Grid Placeholder */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">September 2023</h2>
            <div className="flex gap-2">
              <CalendarButton>Today</CalendarButton>
              <CalendarButton>←</CalendarButton>
              <CalendarButton>→</CalendarButton>
            </div>
          </div>
          
          <div className="text-center p-8">
            <p className="text-gray-400">Calendar integration coming soon!</p>
            <p className="text-gray-500 mt-2">Sync with Google Calendar to manage all your events in one place.</p>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Upcoming Events</h3>
          <p className="text-gray-400">No upcoming events</p>
        </div>
      </div>
    </div>
  );
};

const CalendarButton = ({ children }) => (
  <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
    {children}
  </button>
);

export default Calendar;