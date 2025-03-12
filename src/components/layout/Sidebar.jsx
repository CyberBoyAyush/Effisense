import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FaTachometerAlt, 
  FaListAlt, 
  FaCalendarAlt, 
  FaUser, 
  FaCog, 
  FaChartBar,
  FaTimes
} from "react-icons/fa";

const Sidebar = ({ hidelogo = false, onClose }) => {
  const location = useLocation();

  const NavLink = ({ to, children, icon }) => {
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
        <span className={`text-lg ${isActive ? 'text-orange-400' : 'text-gray-500'}`}>
          {icon}
        </span>
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
          <FaTimes className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        <NavLink to="/dashboard" icon={<FaTachometerAlt />}>
          Dashboard
        </NavLink>
        <NavLink to="/tasks" icon={<FaListAlt />}>
          Tasks
        </NavLink>
        <NavLink to="/calendar" icon={<FaCalendarAlt />}>
          Calendar
        </NavLink>
        
        {/* Additional navigation links - can be uncommented as features are added */}
        {/* <div className="pt-4 mt-4 border-t border-gray-700/30">
          <NavLink to="/profile" icon={<FaUser />}>
            Profile
          </NavLink>
          <NavLink to="/settings" icon={<FaCog />}>
            Settings
          </NavLink>
          <NavLink to="/analytics" icon={<FaChartBar />}>
            Analytics
          </NavLink>
        </div> */}
      </nav>
    </aside>
  );
};

export default Sidebar;