import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ hidelogo = false }) => {
  const location = useLocation();

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200
          ${isActive 
            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' 
            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
      >
        {children}
      </Link>
    );
  };

  return (
    <aside className="h-full bg-gray-900/95 backdrop-blur-sm border-r border-gray-800/50 overflow-y-auto">
      <nav className="p-6 space-y-2">
        <NavLink to="/dashboard">
          <span className="text-xl">🏠</span>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/tasks">
          <span className="text-xl">✓</span>
          <span>Tasks</span>
        </NavLink>
        <NavLink to="/calendar">
          <span className="text-xl">📅</span>
          <span>Calendar</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;