import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCalendarAlt } from "react-icons/fa";

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
    <nav className="bg-gradient-to-r from-gray-900/95 via-gray-900/90 to-orange-950/20 backdrop-blur-md border-b border-orange-800/30 fixed w-full z-30">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            {showMenuButton && (
              <button
                onClick={onMenuClick}
                className="p-2 rounded-lg text-gray-400 hover:text-orange-300 hover:bg-gray-800/50 
                  transition-colors duration-200 md:hidden"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {/* Logo - Updated with initial rotation animation and margin */}
            <Link 
              to={user ? "/dashboard" : "/"} 
              className="flex items-center gap-2 group ml-2 md:ml-4"
            >
              <motion.div
                initial={{ rotate: -180, scale: 0.5, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20, 
                  duration: 0.8 
                }}
                whileHover={{ rotate: 5, scale: 1.1 }}
                className="flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-600 
                  h-8 w-8 rounded-lg shadow-lg shadow-orange-500/20"
              >
                <FaCalendarAlt className="text-white text-lg" />
              </motion.div>
              <motion.span 
                className="text-2xl font-extrabold font-sans text-transparent bg-clip-text bg-gradient-to-r 
                  from-orange-400 to-amber-500 tracking-tight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ opacity: 1 }}
              >
                Effisense
              </motion.span>
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative group">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800/50 
                    transition-all duration-200"
                >
                  {/* Profile Avatar - Updated with orange gradient */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 
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

                <motion.div 
                  className="absolute right-0 mt-1 w-56 rounded-xl bg-gray-800 border border-orange-700/30
                    shadow-lg overflow-hidden"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ 
                    opacity: isDropdownOpen ? 1 : 0, 
                    y: isDropdownOpen ? 0 : -10,
                    height: isDropdownOpen ? 'auto' : 0
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="py-2">
                    <NavLink to="/dashboard" icon="🏠" label="Dashboard" />
                    <NavLink to="/tasks" icon="✓" label="Tasks" />
                    <NavLink to="/calendar" icon="📅" label="Calendar" />
                    <hr className="my-2 border-gray-700" />
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-orange-400 hover:text-orange-300 
                        hover:bg-gray-700/50 transition-colors duration-200 flex items-center gap-3"
                    >
                      <span>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-gray-300 hover:text-orange-300 transition-colors duration-200 font-medium"
                >
                  Login
                </Link>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/signup" 
                    className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg 
                      hover:from-orange-500 hover:to-amber-500 transition-all duration-200 
                      shadow-[0_0_15px_rgba(251,146,60,0.3)] hover:shadow-[0_0_20px_rgba(251,146,60,0.4)]
                      text-sm font-semibold"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// NavLink component
const NavLink = ({ to, icon, label }) => (
  <Link 
    to={to} 
    className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-orange-300 
      hover:bg-gray-700/50 transition-colors duration-200 font-medium"
  >
    <span>{icon}</span>
    <span>{label}</span>
  </Link>
);

export default Navbar;