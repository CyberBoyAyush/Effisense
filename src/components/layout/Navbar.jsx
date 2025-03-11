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
        <div className="flex items-center h-16">
          {/* Mobile Menu Button */}
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="p-2 mr-2 text-gray-400 hover:text-white md:hidden"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Effisense
            </span>
          </Link>

          {/* Auth Section - Updated for mobile */}
          <div className="flex items-center ml-auto">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm md:text-base"
                >
                  <span className="font-medium hidden sm:block">{user.name}</span>
                  <span className="sm:hidden">Menu</span>
                  <svg 
                    className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-gray-800 rounded-xl border border-gray-700 shadow-xl">
                    <Link to="/dashboard" 
                      className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link to="/tasks" 
                      className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                    >
                      Tasks
                    </Link>
                    <Link to="/calendar" 
                      className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                    >
                      Calendar
                    </Link>
                    <hr className="my-2 border-gray-700" />
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-red-400 hover:text-red-300 hover:bg-gray-700/50
                        transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 md:gap-4">
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

export default Navbar;