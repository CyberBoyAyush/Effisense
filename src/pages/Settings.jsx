import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaBell,
  FaGoogle,
  FaMoon,
  FaSun,
  FaCheck,
  FaEdit,
  FaCog,
  FaCalendarAlt,
  FaClipboardList,
  FaCheckCircle,
  FaBullhorn,
  FaExclamationTriangle,
  FaSync,
  FaInfoCircle,
  FaGlobeAsia, // Added for time zone info
} from "react-icons/fa";
import { getUserTasks, updateUserName } from "../utils/database";
import GoogleCalendarSync from "../components/calendar/GoogleCalendarSync";
import {
  checkSignedInStatus,
  getAuthStatus,
  clearAuthStatus,
} from "../utils/googleCalendar";
import { useToast } from "../contexts/ToastContext";

const Settings = () => {
  const { addToast } = useToast();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });

  // Google Calendar connection states
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [authStatusChecked, setAuthStatusChecked] = useState(false);

  // Check Google Calendar connection
  const checkGoogleConnection = useCallback(async () => {
    console.log("Settings: Checking Google Calendar connection status...");

    setIsCheckingConnection(true);
    // Only clear connection error if we're explicitly checking again
    setConnectionError(false);

    try {
      const isConnected = await checkSignedInStatus();
      console.log("Settings: Google Calendar connection status:", isConnected);

      // Only update state if it changed to prevent loops
      if (isConnected !== googleCalendarConnected) {
        setGoogleCalendarConnected(isConnected);
      }

      setLastRefresh(Date.now());
    } catch (error) {
      console.error(
        "Settings: Error checking Google Calendar connection:",
        error
      );
      setGoogleCalendarConnected(false);
      setConnectionError(true);
    } finally {
      setIsCheckingConnection(false);
    }
  }, [googleCalendarConnected]);

  // Handle Google auth status from Appwrite once on mount
  useEffect(() => {
    const checkGoogleAuthStatus = async () => {
      try {
        // Get auth status from Appwrite
        const authStatus = await getAuthStatus();

        if (!authStatus || authStatusChecked) return;

        // Process the auth status
        if (authStatus.success) {
          setGoogleCalendarConnected(true);
          setConnectionError(false);
        } else {
          setGoogleCalendarConnected(false);
          // Only show error toast if this is from a recent connection attempt (within last 30 seconds)
          const isRecent = Date.now() - authStatus.timestamp < 30000;
          if (isRecent) {
            addToast(
              `Google Calendar connection failed: ${
                authStatus.error || "Unknown error"
              }`,
              "error"
            );
          }
        }

        // Clear the auth status from Appwrite after processing
        await clearAuthStatus();
        setAuthStatusChecked(true);
      } catch (error) {
        console.error("Error processing Google auth status:", error);
      }
    };

    // Check auth status and connection on mount
    checkGoogleAuthStatus();
    checkGoogleConnection();
  }, [addToast, checkGoogleConnection, authStatusChecked]);

  useEffect(() => {
    // Load user data
    const loadUser = () => {
      const userData = JSON.parse(localStorage.getItem("loggedInUser"));
      if (userData) {
        setUser(userData);
        setEditedName(userData?.name || "");
      }
    };

    // Load task statistics
    const loadTaskStats = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("loggedInUser"));
        if (userData) {
          const tasks = await getUserTasks(userData.$id);
          setTaskStats({
            total: tasks.length,
            completed: tasks.filter((t) => t.status === "completed").length,
            pending: tasks.filter((t) => t.status !== "completed").length,
          });
        }
      } catch (error) {
        console.error("Error loading task stats:", error);
      }
    };

    loadUser();
    loadTaskStats();
  }, []);

  const handleUpdateName = async () => {
    try {
      // Update name in Appwrite
      const updatedUser = await updateUserName(user.$id, editedName);

      // Update local state and storage only if Appwrite update succeeds
      if (updatedUser) {
        const updatedUserData = { ...user, name: editedName };
        setUser(updatedUserData);
        localStorage.setItem("loggedInUser", JSON.stringify(updatedUserData));
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };

  // Enhanced handler to properly manage connection state changes
  const handleGoogleCalendarStatusChange = useCallback(
    (isConnected) => {
      console.log(
        "Settings: Google Calendar connection status changed:",
        isConnected
      );

      // Only update state if it's different to prevent unnecessary re-renders
      if (isConnected !== googleCalendarConnected) {
        setGoogleCalendarConnected(isConnected);

        // Only show disconnect toast here - connection toasts are handled elsewhere
        if (!isConnected && googleCalendarConnected) {
          addToast("Disconnected from Google Calendar", "info");
        }

        // Clear connection errors when status changes
        setConnectionError(false);
      }
    },
    [googleCalendarConnected, addToast]
  );

  return (
    <div className="p-4 md:p-6 space-y-6 text-gray-200">
      {/* Settings Header */}
      <div className="bg-gradient-to-r from-gray-800/50 to-orange-900/30 p-4 md:p-8 rounded-2xl backdrop-blur-sm border border-orange-800/30">
        <div className="flex items-center gap-3">
          <FaCog className="text-orange-400 text-xl sm:text-2xl" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-sm sm:text-base text-gray-400">
              Manage your account preferences
            </p>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <Section icon={FaUser} title="Profile">
        <div className="space-y-4 sm:space-y-6">
          {/* Profile Info - Improved mobile layout */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-xl sm:text-2xl font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="bg-gray-700/70 border border-gray-600 rounded-lg px-3 py-1.5 text-base sm:text-lg font-medium text-white"
                    autoFocus
                  />
                ) : (
                  <h2 className="text-base sm:text-lg font-medium text-white">
                    {user?.name}
                  </h2>
                )}
                {isEditing ? (
                  <div className="flex gap-1">
                    <button
                      onClick={handleUpdateName}
                      className="p-1 bg-green-600 text-white rounded hover:bg-green-500"
                    >
                      <FaCheck className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedName(user.name);
                      }}
                      className="p-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                  >
                    <FaEdit className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-gray-400 text-sm mt-1 sm:mt-0.5">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Task Stats Grid - Fixed closing tags */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <StatCard
              icon={FaClipboardList}
              title="Total Tasks"
              value={taskStats.total}
            />
            <StatCard
              icon={FaCheckCircle}
              title="Completed"
              value={taskStats.completed}
              color="green"
            />
            <StatCard
              icon={FaClipboardList}
              title="Pending"
              value={taskStats.pending}
              color="amber"
            />
          </div>
        </div>
      </Section>

      {/* Integrations Section - Enhanced with better error handling */}
      <Section icon={FaGoogle} title="Integrations">
        <div className="space-y-4">
          {connectionError && !isCheckingConnection && (
            <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30 mb-4">
              <div className="flex items-start gap-3">
                <div className="text-amber-400 p-2 bg-amber-500/10 rounded-full">
                  <FaExclamationTriangle />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-300">
                    Connection status could not be determined
                  </p>
                  <p className="text-xs text-amber-300/80 mt-1">
                    We couldn't verify your Google Calendar connection. The
                    status below may not be accurate.
                  </p>
                  <button
                    onClick={checkGoogleConnection}
                    className="mt-2 text-xs bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <FaSync
                      className={isCheckingConnection ? "animate-spin" : ""}
                    />
                    {isCheckingConnection
                      ? "Checking..."
                      : "Retry Connection Check"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Time Zone Notice */}
          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30 mb-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-400 p-2 bg-blue-500/10 rounded-full">
                <FaGlobeAsia />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-300">
                  Time Zone Setting Required
                </p>
                <p className="text-xs text-blue-300/80 mt-1">
                  For proper synchronization with Google Calendar, please ensure your Google Calendar time zone is set to <span className="font-semibold text-blue-300">Asia/Kolkata (Indian Standard Time)</span>.
                </p>
                <a 
                  href="https://calendar.google.com/calendar/u/0/r/settings" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 text-xs bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <FaInfoCircle />
                  Open Google Calendar Settings
                </a>
              </div>
            </div>
          </div>

          <GoogleCalendarSync
            key={`google-calendar-sync-${lastRefresh}`}
            onSyncStatusChange={handleGoogleCalendarStatusChange}
            initialConnected={googleCalendarConnected}
            isCheckingConnection={isCheckingConnection}
            refreshConnectionStatus={checkGoogleConnection}
          />
        </div>
      </Section>

      {/* Notifications Section */}
      <Section icon={FaBell} title="Notifications (Coming Soon)">
        <div className="space-y-2 sm:space-y-4">
          <NotificationSetting
            icon={FaBullhorn}
            title="Task Reminders"
            description="Get notified about upcoming tasks"
          />
          <NotificationSetting
            icon={FaCalendarAlt}
            title="Calendar Events"
            description="Get notified about calendar events"
          />
        </div>
      </Section>

      {/* Theme Section */}
      {/* <Section icon={FaMoon} title="Appearance (Coming Soon)">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-medium">Dark Mode</h3>
              <p className="text-xs text-gray-400">Switch between light and dark mode</p>
            </div>
            <ThemeToggle enabled={true} />
          </div>
        </div>
      </Section> */}
    </div>
  );
};

const Section = ({ icon: Icon, title, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800/40 backdrop-blur-sm border border-orange-800/30 rounded-2xl overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-orange-800/30 flex items-center gap-2 bg-gradient-to-r from-gray-800/80 to-orange-950/20">
        <div className="text-orange-400">
          <Icon />
        </div>
        <h2 className="font-medium text-white">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </motion.div>
  );
};

const StatCard = ({ icon: Icon, title, value, color }) => {
  const getColorClass = () => {
    switch (color) {
      case "green":
        return "from-green-500/20 to-green-800/5 border-green-500/30 text-green-400";
      case "amber":
        return "from-amber-500/20 to-amber-800/5 border-amber-500/30 text-amber-400";
      default:
        return "from-orange-500/20 to-orange-800/5 border-orange-500/30 text-orange-400";
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-3 rounded-lg bg-gradient-to-br ${getColorClass()} border`}
    >
      <div className="mb-1">
        <Icon className="text-xl" />
      </div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs opacity-80">{title}</div>
    </div>
  );
};

const NotificationSetting = ({ icon: Icon, title, description }) => {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gray-700/50 text-gray-300">
          <Icon />
        </div>
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        disabled={true}
        className="relative w-12 h-6 rounded-full transition-colors cursor-not-allowed
          bg-gray-700"
      >
        <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform" />
      </button>
    </div>
  );
};

const ThemeToggle = ({ enabled, onChange }) => {
  return (
    <div className="flex items-center gap-3">
      <FaSun className="text-gray-400" />
      <button
        onClick={() => onChange && onChange(!enabled)}
        disabled={true}
        className={`relative w-12 h-6 rounded-full transition-colors cursor-not-allowed
          ${enabled ? "bg-orange-500" : "bg-gray-700"}`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform
            ${enabled ? "transform translate-x-6" : ""}`}
        />
      </button>
      <FaMoon className="text-gray-300" />
    </div>
  );
};

export default Settings;
