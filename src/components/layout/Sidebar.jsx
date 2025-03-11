import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-900 text-white h-screen p-4">
      <h2 className="text-xl font-bold">Effisense</h2>
      <nav className="mt-6">
        <Link to="/dashboard" className="block py-2 px-4 hover:bg-gray-700 rounded">Dashboard</Link>
        <Link to="/dashboard/tasks" className="block py-2 px-4 hover:bg-gray-700 rounded">Tasks</Link>
        <Link to="/dashboard/calendar" className="block py-2 px-4 hover:bg-gray-700 rounded">Calendar</Link>
      </nav>
    </aside>
  );
};

export default Sidebar;