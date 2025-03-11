import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = ({ onMenuClick, showMenuButton }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Check if user is authenticated
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  
  // Check if current path is a protected route
  const isProtectedRoute = ['/dashboard', '/tasks', '/calendar'].some(
    path => location.pathname.startsWith(path)
  );

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50 fixed w-full z-30">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button - Updated */}
            {showMenuButton && (
              <button
                onClick={onMenuClick}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 
                  transition-colors duration-200 md:hidden"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {/* Logo - Enhanced */}
            <Link 
              to={user ? "/dashboard" : "/"} 
              className="flex items-center gap-2 group"
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 
                bg-clip-text text-transparent group-hover:to-purple-400 transition-all duration-300">
                Effisense
              </span>
            </Link>
          </div>

          {/* Auth Section - Redesigned */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative group">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800/50 
                    transition-all duration-200"
                >
                  {/* Profile Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 
                    flex items-center justify-center text-white font-medium">
                    {user.name[0].toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 
                      ${isDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div 
                  className={`absolute right-0 mt-1 w-56 rounded-xl bg-gray-800 border border-gray-700
                    shadow-lg transform transition-all duration-200 origin-top-right
                    ${isDropdownOpen 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
                >
                  <div className="py-2">
                    <NavLink to="/dashboard" icon="🏠" label="Dashboard" />
                    <NavLink to="/tasks" icon="✓" label="Tasks" />
                    <NavLink to="/calendar" icon="📅" label="Calendar" />
                    <hr className="my-2 border-gray-700" />
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-red-400 hover:text-red-300 
                        hover:bg-gray-700/50 transition-colors duration-200 flex items-center gap-3"
                    >
                      <span>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                    transform hover:scale-105 transition-all duration-200 
                    shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]
                    text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// New NavLink component for dropdown menu
const NavLink = ({ to, icon, label }) => (
  <Link 
    to={to} 
    className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white 
      hover:bg-gray-700/50 transition-colors duration-200"
  >
    <span>{icon}</span>
    <span>{label}</span>
  </Link>
);

export default Navbar;