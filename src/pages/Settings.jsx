import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUser, FaBell, FaGoogle, FaMoon, FaSun, 
  FaCheck, FaEdit, FaCog, FaCalendarAlt,
  FaClipboardList, FaCheckCircle, FaBullhorn
} from 'react-icons/fa';
import { getUserTasks, updateUserName } from '../utils/database';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    pending: 0
  });

  useEffect(() => {
    // Load user data
    const loadUser = () => {
      const userData = JSON.parse(localStorage.getItem('loggedInUser'));
      setUser(userData);
      setEditedName(userData?.name || '');
    };

    // Load task statistics
    const loadTaskStats = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('loggedInUser'));
        if (userData) {
          const tasks = await getUserTasks(userData.$id);
          setTaskStats({
            total: tasks.length,
            completed: tasks.filter(t => t.completed).length,
            pending: tasks.filter(t => !t.completed).length
          });
        }
      } catch (error) {
        console.error('Error loading task stats:', error);
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
        localStorage.setItem('loggedInUser', JSON.stringify(updatedUserData));
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating name:', error);
      // Optionally show an error message to the user
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 text-gray-200">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <FaCog className="text-4xl text-orange-400" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-gray-400">Manage your account preferences and settings</p>
          </div>
        </div>

        {/* Profile Section */}
        <Section icon={FaUser} title="Profile">
          <div className="space-y-6">
            {/* Profile Info */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-2xl font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="bg-gray-800/50 border border-orange-500/30 rounded-lg px-3 py-2 text-lg font-semibold focus:outline-none focus:border-orange-500"
                    />
                  ) : (
                    <h2 className="text-lg font-semibold text-white">{user?.name}</h2>
                  )}
                  <button
                    onClick={() => isEditing ? handleUpdateName() : setIsEditing(true)}
                    className="p-2 text-orange-400 hover:text-orange-300 rounded-lg hover:bg-orange-400/10 transition-colors"
                  >
                    {isEditing ? <FaCheck /> : <FaEdit />}
                  </button>
                </div>
                <p className="text-gray-400">{user?.email}</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard icon={FaClipboardList} title="Total Tasks" value={taskStats.total} />
              <StatCard icon={FaCheckCircle} title="Completed" value={taskStats.completed} color="green" />
              <StatCard icon={FaClipboardList} title="Pending" value={taskStats.pending} color="amber" />
            </div>
          </div>
        </Section>

        {/* Integrations Section */}
        <Section icon={FaGoogle} title="Integrations">
          <div className="space-y-4">
            <IntegrationCard
              icon={FaCalendarAlt}
              title="Google Calendar"
              description="Sync your tasks with Google Calendar"
              comingSoon
            />
          </div>
        </Section>

        {/* Notifications Section */}
        <Section icon={FaBell} title="Notifications (Coming Soon)">
          <div className="space-y-4">
            <NotificationSetting
              icon={FaBullhorn}
              title="Task Reminders"
              description="Get notified about upcoming tasks"
            />
            <NotificationSetting
              icon={FaCheckCircle}
              title="Task Completion"
              description="Get notified when tasks are completed"
            />
          </div>
        </Section>
      </motion.div>
    </div>
  );
};

const Section = ({ icon: Icon, title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-800/30 backdrop-blur-sm border border-orange-800/30 rounded-xl overflow-hidden"
  >
    <div className="p-6 border-b border-gray-700/50">
      <div className="flex items-center gap-3">
        <Icon className="text-2xl text-orange-400" />
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </motion.div>
);

const StatCard = ({ icon: Icon, title, value, color = "orange" }) => (
  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 flex flex-col items-center text-center">
    <Icon className={`text-2xl ${color === "green" ? "text-green-400" : color === "amber" ? "text-amber-400" : "text-orange-400"}`} />
    <h3 className="text-sm text-gray-400 mt-2">{title}</h3>
    <p className="text-2xl font-bold text-white mt-1">{value}</p>
  </div>
);

const IntegrationCard = ({ icon: Icon, title, description, comingSoon }) => (
  <div className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl">
    <div className="flex items-center gap-4">
      <Icon className="text-2xl text-orange-400" />
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
    <button
      disabled={comingSoon}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
        ${comingSoon
          ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
          : 'bg-orange-500 text-white hover:bg-orange-600'
        }`}
    >
      {comingSoon ? 'Coming Soon' : 'Connect'}
    </button>
  </div>
);

const NotificationSetting = ({ icon: Icon, title, description }) => {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl">
      <div className="flex items-center gap-4">
        <Icon className="text-2xl text-orange-400" />
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`w-12 h-6 rounded-full transition-colors relative
          ${enabled ? 'bg-orange-500' : 'bg-gray-700'}`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform
            ${enabled ? 'transform translate-x-6' : ''}`}
        />
      </button>
    </div>
  );
};

export default Settings;
