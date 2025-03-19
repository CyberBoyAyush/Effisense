import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaTachometerAlt, 
  FaListAlt, 
  FaCalendarAlt, 
  FaUser, 
  FaCog, 
  FaChartBar,
  FaTimes,
  FaBell,
  FaPalette,
  FaShieldAlt,
  FaQuestionCircle
} from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";

const Sidebar = ({ hidelogo = false, onClose }) => {
  const location = useLocation();

  // Add container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  // Add item animation variants
  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    show: { x: 0, opacity: 1 }
  };

  const NavLink = ({ to, children, icon, gradient }) => {
    const isActive = location.pathname === to;
    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ 
          scale: 1.02,
          transition: { type: "spring", stiffness: 400 }
        }}
        whileTap={{ scale: 0.98 }}
      >
        <Link 
          to={to} 
          className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200
            ${isActive 
              ? `bg-gradient-to-r ${gradient || 'from-orange-600/20 to-amber-600/20'} 
                 text-orange-400 border border-orange-500/20 shadow-lg shadow-orange-500/10` 
              : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
            }`}
        >
          <motion.span 
            className={`text-lg ${isActive ? 'text-orange-400' : 'text-gray-500'}`}
            animate={{ rotate: isActive ? 360 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {icon}
          </motion.span>
          <span className="font-medium">{children}</span>
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400"
            />
          )}
        </Link>
      </motion.div>
    );
  };

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      className="h-full bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-orange-950/20 backdrop-blur-sm border-r border-orange-800/30 flex flex-col"
    >
      {/* Mobile Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 md:hidden border-b border-orange-800/20"
      >
        <h2 className="text-lg font-semibold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
          Menu
        </h2>
        <motion.button
          whileHover={{ rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-orange-300 rounded-lg transition-colors"
        >
          <FaTimes className="w-5 h-5" />
        </motion.button>
      </motion.div>

      <motion.nav
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar"
      >
        <motion.div className="space-y-1">
          <NavLink to="/dashboard" icon={<FaTachometerAlt />} gradient="from-orange-600/20 to-amber-600/20">
            Dashboard
          </NavLink>
          <NavLink to="/tasks" icon={<FaListAlt />} gradient="from-blue-600/20 to-cyan-600/20">
            Tasks
          </NavLink>
          <NavLink to="/calendar" icon={<FaCalendarAlt />} gradient="from-purple-600/20 to-pink-600/20">
            Calendar
          </NavLink>
        </motion.div>

        {/* Settings Section - New Addition */}
        <motion.div 
          variants={itemVariants}
          className="pt-4 mt-4 border-t border-gray-700/30"
        >
        </motion.div>
      </motion.nav>

      {/* Bottom Section with Help & Settings */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-4 border-t border-orange-800/20 space-y-2"
      >
        <motion.div
          whileHover={{ 
            scale: 1.02,
            transition: { type: "spring", stiffness: 400 }
          }}
        >
          <Link 
            to="/settings"
            className="flex items-center gap-3 py-2 px-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10 
              text-orange-300 rounded-lg hover:from-orange-500/20 hover:to-amber-500/20 transition-all duration-200"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <IoSettingsSharp />
            </motion.div>
            <span>Settings</span>
          </Link>
        </motion.div>
      </motion.div>
    </motion.aside>
  );
};

export default Sidebar;