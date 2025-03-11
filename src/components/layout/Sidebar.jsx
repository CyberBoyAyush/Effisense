import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ hidelogo = false, onClose }) => {
  const location = useLocation();

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200
          ${isActive 
            ? 'bg-orange-600/20 text-orange-400 border border-orange-500/20' 
            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
      >
        {children}
      </Link>
    );
  };

  return (
    <aside className="h-full bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-orange-950/20 backdrop-blur-sm border-r border-orange-800/30 flex flex-col">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 md:hidden border-b border-orange-800/20">
        <h2 className="text-lg font-semibold text-orange-300">Menu</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-orange-300 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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