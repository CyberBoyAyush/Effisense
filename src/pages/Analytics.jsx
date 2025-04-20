import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Sector, ReferenceLine, 
} from "recharts";
import { 
  FaChartLine, FaChartPie, FaChartBar, FaClock, FaLightbulb, 
  FaBrain, FaSpinner, FaSyncAlt, FaFire, FaCalendarAlt,
  FaFilter, FaDownload, FaArrowUp, FaArrowDown
} from "react-icons/fa";

import { getUserTasks } from "../utils/database";
import { generateFreeTimeSuggestions, generateBehaviorInsights } from "../utils/aiAssistant";

const Analytics = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [timeSlots, setTimeSlots] = useState(null);
  const [behaviorInsights, setBehaviorInsights] = useState(null);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'all'
  const [activeMetrics, setActiveMetrics] = useState({
    completed: 0,
    total: 0,
    completion: 0,
    streak: 0,
    trend: 0
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
        
        if (currentUser && currentUser.$id) {
          const userTasks = await getUserTasks(currentUser.$id);
          setTasks(userTasks);
          
          // Calculate summary metrics
          const completed = userTasks.filter(task => task.status === 'completed').length;
          const total = userTasks.length;
          const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
          
          // Calculate trend (% change in completion rate from previous period)
          const todayTasks = userTasks.filter(task => {
            const taskDate = new Date(task.createdAt).toDateString();
            const today = new Date().toDateString();
            return taskDate === today;
          });
          
          const yesterdayTasks = userTasks.filter(task => {
            const taskDate = new Date(task.createdAt);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return taskDate.toDateString() === yesterday.toDateString();
          });
          
          const todayCompleted = todayTasks.filter(task => task.status === 'completed').length;
          const todayCompletionRate = todayTasks.length > 0 ? (todayCompleted / todayTasks.length) * 100 : 0;
          
          const yesterdayCompleted = yesterdayTasks.filter(task => task.status === 'completed').length;
          const yesterdayCompletionRate = yesterdayTasks.length > 0 ? (yesterdayCompleted / yesterdayTasks.length) * 100 : 0;
          
          const trend = yesterdayCompletionRate > 0 
            ? Math.round((todayCompletionRate - yesterdayCompletionRate) / yesterdayCompletionRate * 100) 
            : 0;
          
          setActiveMetrics({
            completed,
            total,
            completion: completionRate,
            streak: getStreak(userTasks),
            trend
          });
          
          // Generate AI insights
          setLoadingAI(true);
          const timeSuggestions = await generateFreeTimeSuggestions(userTasks);
          const insights = await generateBehaviorInsights(userTasks);
          
          setTimeSlots(timeSuggestions);
          setBehaviorInsights(insights);
        }
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load analytics data. Please try again.");
      } finally {
        setIsLoading(false);
        setLoadingAI(false);
      }
    };
    
    fetchTasks();
  }, []);
  
  // Calculate streak
  const getStreak = (taskData) => {
    const today = new Date();
    const dates = [];
    
    // Get dates with completed tasks
    taskData.forEach(task => {
      if (task.status === 'completed' && task.completedAt) {
        const completedDate = new Date(task.completedAt).toDateString();
        if (!dates.includes(completedDate)) {
          dates.push(completedDate);
        }
      }
    });
    
    // Sort dates in descending order (most recent first)
    dates.sort((a, b) => new Date(b) - new Date(a));
    
    let currentStreak = 0;
    let currentDate = new Date();
    
    // Calculate streak by checking consecutive days
    while (true) {
      const dateString = currentDate.toDateString();
      if (dates.includes(dateString)) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return currentStreak;
  };
  
  // Regenerate AI insights on demand
  const handleRegenerateInsights = async () => {
    try {
      setLoadingAI(true);
      const insights = await generateBehaviorInsights(tasks);
      setBehaviorInsights(insights);
    } catch (err) {
      console.error("Error regenerating insights:", err);
    } finally {
      setLoadingAI(false);
    }
  };
  
  // Regenerate time suggestions on demand
  const handleRegenerateTimeSlots = async () => {
    try {
      setLoadingAI(true);
      const suggestions = await generateFreeTimeSuggestions(tasks);
      setTimeSlots(suggestions);
    } catch (err) {
      console.error("Error regenerating time slots:", err);
    } finally {
      setLoadingAI(false);
    }
  };

  // Export analytics data to CSV
  const handleExportData = () => {
    try {
      // Prepare CSV data from tasks
      const headers = "Task Name,Status,Category,Created Date,Completed Date\n";
      const csvData = tasks.map(task => {
        return `"${task.title || ''}","${task.status || ''}","${task.category || ''}","${task.createdAt || ''}","${task.completedAt || ''}"`;
      }).join('\n');
      
      // Create and download the file
      const blob = new Blob([headers + csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'effisense_analytics.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error exporting data:", err);
    }
  };

  // Filter tasks based on time range
  const getFilteredTasks = () => {
    const now = new Date();
    
    if (timeRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return tasks.filter(task => new Date(task.createdAt) >= weekAgo);
    } 
    else if (timeRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      return tasks.filter(task => new Date(task.createdAt) >= monthAgo);
    }
    
    return tasks; // 'all' time range
  };

  // Data processing functions
  const getWeeklyTaskTrend = () => {
    const filteredTasks = getFilteredTasks();
    let dates = [];
    let format = {};
    
    // Determine date range based on selected time period
    if (timeRange === 'week') {
      // Get dates for the last 7 days
      dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });
      format = { weekday: 'short', month: 'short', day: 'numeric' };
    } else if (timeRange === 'month') {
      // Get dates for the last 30 days, but group by week
      dates = Array.from({ length: 4 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (21 - i * 7));
        return date.toISOString().split('T')[0];
      });
      format = { month: 'short', day: 'numeric' };
    } else {
      // All time, group by month (up to 6 months)
      dates = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        date.setDate(1);
        return date.toISOString().split('T')[0];
      });
      format = { month: 'short', year: 'numeric' };
    }
    
    // Initialize data structure with zeros
    const data = dates.map(date => {
      const displayDate = new Date(date).toLocaleDateString('en-US', format);
      return {
        date: displayDate,
        created: 0,
        completed: 0
      };
    });
    
    // Process tasks differently based on time range
    filteredTasks.forEach(task => {
      let createdIndex = -1;
      let completedIndex = -1;
      
      if (task.createdAt) {
        const createdDate = new Date(task.createdAt);
        // Find the appropriate bin based on time range
        if (timeRange === 'week') {
          const dateStr = createdDate.toISOString().split('T')[0];
          createdIndex = dates.indexOf(dateStr);
        } else if (timeRange === 'month') {
          // Group by week
          const weekIndex = Math.floor((new Date() - createdDate) / (7 * 24 * 60 * 60 * 1000));
          if (weekIndex >= 0 && weekIndex < 4) createdIndex = 3 - weekIndex;
        } else {
          // Group by month
          const monthIndex = (new Date().getMonth() - createdDate.getMonth() + 12) % 12;
          if (monthIndex >= 0 && monthIndex < 6) createdIndex = 5 - monthIndex;
        }
        
        if (createdIndex !== -1) {
          data[createdIndex].created += 1;
        }
      }
      
      if (task.completedAt && task.status === 'completed') {
        const completedDate = new Date(task.completedAt);
        // Find the appropriate bin based on time range
        if (timeRange === 'week') {
          const dateStr = completedDate.toISOString().split('T')[0];
          completedIndex = dates.indexOf(dateStr);
        } else if (timeRange === 'month') {
          // Group by week
          const weekIndex = Math.floor((new Date() - completedDate) / (7 * 24 * 60 * 60 * 1000));
          if (weekIndex >= 0 && weekIndex < 4) completedIndex = 3 - weekIndex;
        } else {
          // Group by month
          const monthIndex = (new Date().getMonth() - completedDate.getMonth() + 12) % 12;
          if (monthIndex >= 0 && monthIndex < 6) completedIndex = 5 - monthIndex;
        }
        
        if (completedIndex !== -1) {
          data[completedIndex].completed += 1;
        }
      }
    });
    
    return data;
  };
  
  const getTaskStatusBreakdown = () => {
    const filteredTasks = getFilteredTasks();
    const statuses = {
      pending: 0,
      'in-progress': 0,
      completed: 0
    };
    
    filteredTasks.forEach(task => {
      const status = task.status || 'pending';
      statuses[status] = (statuses[status] || 0) + 1;
    });
    
    return Object.keys(statuses).map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
      value: statuses[status]
    }));
  };
  
  const getCategoryDistribution = () => {
    const filteredTasks = getFilteredTasks();
    const categories = {};
    
    filteredTasks.forEach(task => {
      const category = task.category || 'uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    return Object.keys(categories).map(category => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      count: categories[category],
      fill: getCategoryColor(category)
    }));
  };
  
  const getProductivityByHour = () => {
    const filteredTasks = getFilteredTasks();
    const hourCounts = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: 0,
      displayHour: `${i === 0 ? 12 : i > 12 ? i - 12 : i}${i >= 12 ? 'PM' : 'AM'}`
    }));
    
    // Count completed tasks by hour based on endTime
    filteredTasks.forEach(task => {
      if (task.status === 'completed' && task.endTime) {
        try {
          const endTime = new Date(task.endTime);
          const hour = endTime.getHours();
          hourCounts[hour].count += 1;
        } catch (err) {
          // Skip invalid dates
        }
      }
    });
    
    // Only return hours with data and waking hours (6AM-11PM)
    return hourCounts.filter(hour => hour.hour >= 6 && hour.hour <= 23);
  };
  
  const getTaskStreak = () => {
    const today = new Date();
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(today.getDate() - 13);
    
    // Initialize streak data
    const streakData = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date(twoWeeksAgo);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      streakData.push({
        date: dateString,
        displayDate: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        hasCompletedTask: false
      });
    }
    
    // Mark days with completed tasks
    tasks.forEach(task => {
      if (task.completedAt && task.status === 'completed') {
        const completedDate = new Date(task.completedAt).toISOString().split('T')[0];
        const streakDay = streakData.find(day => day.date === completedDate);
        if (streakDay) {
          streakDay.hasCompletedTask = true;
        }
      }
    });
    
    return streakData;
  };
  
  // Helper function for category colors
  const getCategoryColor = (category) => {
    const colorMap = {
      work: '#4f46e5', // Indigo
      personal: '#ec4899', // Pink
      health: '#10b981', // Emerald
      uncategorized: '#6b7280', // Gray
    };
    
    return colorMap[category.toLowerCase()] || '#6b7280';
  };
  
  // Prepare chart data
  const weeklyTrendData = getWeeklyTaskTrend();
  const taskStatusData = getTaskStatusBreakdown();
  const categoryDistribution = getCategoryDistribution();
  const productivityHours = getProductivityByHour();
  const streakData = getTaskStreak();
  
  // Calculate streak count (consecutive days with completed tasks)
  const currentStreak = (() => {
    let streak = 0;
    const reversedStreak = [...streakData].reverse();
    
    for (const day of reversedStreak) {
      if (day.hasCompletedTask) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  })();
  
  // Color constants for charts - Updated to match orangish theme
  const COLORS = ['#f97316', '#fb923c', '#f59e0b', '#fdba74', '#ea580c'];
  
  // Active segment for pie chart
  const [activeIndex, setActiveIndex] = useState(0);
  const onPieEnter = (_, index) => setActiveIndex(index);
  
  // Render active shape for enhanced pie chart
  const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
  
    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.9}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
          opacity={0.7}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#fff" fontSize={12}>
          {`${value} tasks`}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#fbcba6" fontSize={12}>
          {`(${(percent * 100).toFixed(0)}%)`}
        </text>
      </g>
    );
  };

  // Create custom tooltip for charts with enhanced styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-md border border-orange-500/30 px-4 py-3 rounded-md shadow-lg">
          <p className="text-orange-300 text-sm font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center gap-2 mb-1" style={{ color: entry.color || '#f97316' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || '#f97316' }}></span>
              <span>{entry.name}: <span className="font-medium">{entry.value}</span></span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-orange-300 mt-6 text-lg font-medium">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-lg text-center shadow-lg backdrop-blur-sm">
          <p className="text-red-400 mb-4 text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-red-500 hover:to-orange-500 transition-all shadow-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="p-6">
        <motion.h1 
          className="text-2xl md:text-3xl font-bold mb-8 bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Analytics Dashboard
        </motion.h1>
        <motion.div 
          className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-md border border-orange-500/30 rounded-xl p-8 text-center shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-orange-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaChartLine className="text-4xl text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">No Analytics Data Available</h2>
          <p className="text-gray-300 mb-8 max-w-md mx-auto">
            Start creating and completing tasks to see your productivity insights and analytics.
          </p>
          <a 
            href="/tasks" 
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-500 hover:to-amber-500 transition-all duration-300 font-medium shadow-lg shadow-orange-600/20"
          >
            Create Your First Task
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4"
      >
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="flex items-center bg-gray-800/80 rounded-lg overflow-hidden border border-orange-500/20">
            <button 
              onClick={() => setTimeRange('week')} 
              className={`px-3 py-2 text-sm ${timeRange === 'week' 
                ? 'bg-orange-500 text-white font-medium' 
                : 'text-gray-300 hover:bg-orange-500/10'}`}
            >
              Week
            </button>
            <button 
              onClick={() => setTimeRange('month')} 
              className={`px-3 py-2 text-sm ${timeRange === 'month' 
                ? 'bg-orange-500 text-white font-medium' 
                : 'text-gray-300 hover:bg-orange-500/10'}`}
            >
              Month
            </button>
            <button 
              onClick={() => setTimeRange('all')} 
              className={`px-3 py-2 text-sm ${timeRange === 'all' 
                ? 'bg-orange-500 text-white font-medium' 
                : 'text-gray-300 hover:bg-orange-500/10'}`}
            >
              All Time
            </button>
          </div>
          
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-800/80 text-orange-300 rounded-lg border border-orange-500/20 hover:bg-orange-500/10 transition-colors"
          >
            <FaDownload className="text-xs" /> Export
          </button>
        </div>
      </motion.div>
      
      {/* Summary Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6"
      >
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-md border border-orange-500/20 rounded-xl p-4 hover:border-orange-500/40 transition-all shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-xs">Total Tasks</p>
              <h3 className="text-2xl font-bold text-white mt-1">{activeMetrics.total}</h3>
            </div>
            <div className="bg-orange-500/10 p-2 rounded-lg">
              <FaChartBar className="text-orange-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-md border border-orange-500/20 rounded-xl p-4 hover:border-orange-500/40 transition-all shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-xs">Completed</p>
              <h3 className="text-2xl font-bold text-green-400 mt-1">{activeMetrics.completed}</h3>
            </div>
            <div className="bg-green-500/10 p-2 rounded-lg">
              <FaChartBar className="text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-md border border-orange-500/20 rounded-xl p-4 hover:border-orange-500/40 transition-all shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-xs">Completion Rate</p>
              <h3 className="text-2xl font-bold text-white mt-1">{activeMetrics.completion}%</h3>
            </div>
            <div className="bg-orange-500/10 p-2 rounded-lg">
              <FaChartPie className="text-orange-400" />
            </div>
          </div>
          <div className="mt-2 w-full bg-gray-700/50 rounded-full h-1.5">
            <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${activeMetrics.completion}%` }}></div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-md border border-orange-500/20 rounded-xl p-4 hover:border-orange-500/40 transition-all shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-xs">Current Streak</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{activeMetrics.streak} day{activeMetrics.streak !== 1 ? 's' : ''}</h3>
            </div>
            <div className="bg-amber-500/10 p-2 rounded-lg">
              <FaFire className="text-amber-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-md border border-orange-500/20 rounded-xl p-4 hover:border-orange-500/40 transition-all shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-xs">Trend</p>
              <div className="flex items-center gap-1 mt-1">
                <h3 className="text-2xl font-bold text-white">{Math.abs(activeMetrics.trend)}%</h3>
                {activeMetrics.trend > 0 ? (
                  <FaArrowUp className="text-green-400" />
                ) : activeMetrics.trend < 0 ? (
                  <FaArrowDown className="text-red-400" />
                ) : null}
              </div>
            </div>
            <div className="bg-orange-500/10 p-2 rounded-lg">
              <FaChartLine className="text-orange-400" />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weekly Task Trend Chart (Line Chart) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-md border border-orange-500/20 rounded-xl p-5 lg:col-span-2 transition-all duration-300 shadow-lg"
          whileHover={{ boxShadow: "0 8px 30px rgba(249, 115, 22, 0.07)", y: -2 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <div className="bg-orange-500/10 p-2 rounded-lg mr-3">
                <FaChartLine className="text-orange-400" />
              </div>
              <h2 className="text-lg font-medium text-white">
                {timeRange === 'week' ? 'Weekly' : timeRange === 'month' ? 'Monthly' : 'All Time'} Task Trend
              </h2>
            </div>
            
            <div className="text-xs text-gray-400 flex items-center">
              <FaCalendarAlt className="mr-1" /> 
              {timeRange === 'week' ? 'Last 7 days' : timeRange === 'month' ? 'Last 30 days' : 'All time'}
            </div>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weeklyTrendData}
                margin={{ top: 5, right: 20, left: 0, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#d1d5db', fontSize: 12 }}
                  tickLine={{ stroke: '#4B5563' }}
                  axisLine={{ stroke: '#4B5563' }}
                  tick={props => {
                    const { x, y, payload } = props;
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text x={0} y={0} dy={16} textAnchor="middle" fill="#d1d5db" fontSize={12}>
                          {payload.value.split(' ')[0]}
                        </text>
                      </g>
                    );
                  }}
                />
                <YAxis 
                  tick={{ fill: '#d1d5db', fontSize: 12 }}
                  tickLine={{ stroke: '#4B5563' }}
                  axisLine={{ stroke: '#4B5563' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{paddingTop: '10px'}}
                  formatter={(value) => <span className="text-gray-300">{value}</span>}
                  onClick={(e) => console.log(e)}
                />
                <ReferenceLine y={0} stroke="#4B5563" />
                <Line 
                  type="monotone" 
                  dataKey="created" 
                  name="Tasks Created" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={{ fill: '#f97316', r: 4, strokeWidth: 0 }} 
                  activeDot={{ r: 7, fill: "#f97316", stroke: "#fff", strokeWidth: 2 }}
                  animationDuration={1500}
                  fillOpacity={1}
                  fill="url(#createdGradient)"
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  name="Tasks Completed" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 4, strokeWidth: 0 }} 
                  activeDot={{ r: 7, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
                  animationDuration={1500}
                  animationBegin={300}
                  fillOpacity={1}
                  fill="url(#completedGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Task Status Breakdown (Pie Chart) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-md border border-orange-500/20 rounded-xl p-5 transition-all duration-300 shadow-lg"
          whileHover={{ boxShadow: "0 8px 30px rgba(249, 115, 22, 0.07)", y: -2 }}
        >
          <div className="flex items-center mb-5">
            <div className="bg-orange-500/10 p-2 rounded-lg mr-3">
              <FaChartPie className="text-orange-400" />
            </div>
            <h2 className="text-lg font-medium text-white">Task Status Breakdown</h2>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#f97316"
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  animationBegin={200}
                  animationDuration={1500}
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Task Category Distribution (Bar Chart) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-md border border-orange-500/20 rounded-xl p-5 transition-all duration-300 shadow-lg"
          whileHover={{ boxShadow: "0 8px 30px rgba(249, 115, 22, 0.07)", y: -2 }}
        >
          <div className="flex items-center mb-5">
            <div className="bg-orange-500/10 p-2 rounded-lg mr-3">
              <FaChartBar className="text-orange-400" />
            </div>
            <h2 className="text-lg font-medium text-white">Task Categories</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryDistribution}
                margin={{ top: 5, right: 20, left: 0, bottom: 20 }}
                barGap={8}
              >
                <defs>
                  {categoryDistribution.map((entry, index) => (
                    <linearGradient 
                      key={`gradient-${index}`}
                      id={`barGradient-${index}`} 
                      x1="0" y1="0" x2="0" y2="1"
                    >
                      <stop offset="0%" stopColor={entry.fill || COLORS[index % COLORS.length]} stopOpacity={1}/>
                      <stop offset="95%" stopColor={entry.fill || COLORS[index % COLORS.length]} stopOpacity={0.7}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#d1d5db', fontSize: 12 }}
                  tickLine={{ stroke: '#4B5563' }}
                  axisLine={{ stroke: '#4B5563' }}
                />
                <YAxis 
                  tick={{ fill: '#d1d5db', fontSize: 12 }}
                  tickLine={{ stroke: '#4B5563' }}
                  axisLine={{ stroke: '#4B5563' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  name="Tasks" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#barGradient-${index})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Productivity Hour Chart (Bar Chart) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-md border border-orange-500/20 rounded-xl p-5 transition-all duration-300 lg:col-span-2 shadow-lg"
          whileHover={{ boxShadow: "0 8px 30px rgba(249, 115, 22, 0.07)", y: -2 }}
        >
          <div className="flex items-center mb-5">
            <div className="bg-orange-500/10 p-2 rounded-lg mr-3">
              <FaClock className="text-orange-400" />
            </div>
            <h2 className="text-lg font-medium text-white">Productivity by Hour</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={productivityHours}
                margin={{ top: 5, right: 20, left: 0, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="hourGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="displayHour" 
                  tick={{ fill: '#d1d5db', fontSize: 11 }}
                  tickLine={{ stroke: '#4B5563' }}
                  axisLine={{ stroke: '#4B5563' }}
                />
                <YAxis 
                  tick={{ fill: '#d1d5db', fontSize: 12 }}
                  tickLine={{ stroke: '#4B5563' }}
                  axisLine={{ stroke: '#4B5563' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  name="Tasks Completed" 
                  fill="url(#hourGradient)" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                >
                  {productivityHours.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`rgba(249, 115, 22, ${0.4 + (entry.count / Math.max(...productivityHours.map(h => h.count)) * 0.6)})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Smart Time Slot Suggestions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-md border border-orange-500/20 rounded-xl p-5 transition-all duration-300 shadow-lg relative"
          whileHover={{ boxShadow: "0 8px 30px rgba(249, 115, 22, 0.07)", y: -2 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <div className="bg-orange-500/10 p-2 rounded-lg mr-3">
                <FaLightbulb className="text-orange-400" />
              </div>
              <h2 className="text-lg font-medium text-white">Smart Time Suggestions</h2>
            </div>
            <button
              onClick={handleRegenerateTimeSlots}
              disabled={loadingAI}
              className="text-orange-400 hover:text-orange-300 transition-colors p-2 rounded-full hover:bg-orange-500/10"
              title="Regenerate suggestions"
            >
              {loadingAI ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaSyncAlt />
              )}
            </button>
          </div>
          
          <div className="min-h-[12rem]">
            <AnimatePresence mode="wait">
              {loadingAI && !timeSlots ? (
                <motion.div 
                  key="loading-slots"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-full py-10"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-3 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                    <p className="text-orange-300 text-sm mt-4">Generating suggestions...</p>
                  </div>
                </motion.div>
              ) : timeSlots?.slots?.length > 0 ? (
                <motion.div 
                  key="show-slots"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-sm font-medium text-orange-400 mb-3">Recommended Time Slots:</h3>
                      <ul className="space-y-2 pl-1">
                        {timeSlots.slots.map((slot, index) => (
                          <motion.li 
                            key={index} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-center gap-2 text-gray-200"
                          >
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            <span>{slot}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    
                    {timeSlots.focusWindow && (
                      <div>
                        <h3 className="text-sm font-medium text-orange-400 mb-3">Best Deep Focus Window:</h3>
                        <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/10 rounded-lg px-4 py-3 text-orange-300 border border-orange-500/20">
                          {timeSlots.focusWindow}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-orange-400 mb-2">Reasoning:</h3>
                      <p className="text-sm text-gray-300">
                        {timeSlots.reasoning}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-orange-500/20">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>Powered by</span>
                      <span className="text-xs font-medium bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">LLaMA 3.3</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="no-slots"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-48 text-center"
                >
                  <div>
                    <div className="bg-orange-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FaLightbulb className="text-orange-400/50" />
                    </div>
                    <p className="text-gray-300">Not enough task data to generate time suggestions.</p>
                    <p className="text-sm mt-2 text-orange-400/70">Complete more tasks with scheduled times.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* AI Behavior Insights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-md border border-orange-500/20 rounded-xl p-5 transition-all duration-300 shadow-lg"
          whileHover={{ boxShadow: "0 8px 30px rgba(249, 115, 22, 0.07)", y: -2 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <div className="bg-orange-500/10 p-2 rounded-lg mr-3">
                <FaBrain className="text-orange-400" />
              </div>
              <h2 className="text-lg font-medium text-white">Behavior Insights</h2>
            </div>
            <button
              onClick={handleRegenerateInsights}
              disabled={loadingAI}
              className="text-orange-400 hover:text-orange-300 transition-colors p-2 rounded-full hover:bg-orange-500/10"
              title="Regenerate insights"
            >
              {loadingAI ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaSyncAlt />
              )}
            </button>
          </div>
          
          <div className="min-h-[12rem]">
            <AnimatePresence mode="wait">
              {loadingAI && !behaviorInsights ? (
                <motion.div 
                  key="loading-insights"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-full py-10"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-3 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                    <p className="text-orange-300 text-sm mt-4">Analyzing your behavior...</p>
                  </div>
                </motion.div>
              ) : behaviorInsights?.length > 0 ? (
                <motion.div 
                  key="show-insights"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ul className="space-y-3 mb-4">
                    {behaviorInsights.map((insight, index) => (
                      <motion.li 
                        key={index} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-gradient-to-r from-orange-500/10 to-amber-500/5 rounded-lg p-3 border border-orange-500/10 text-gray-200"
                      >
                        <div className="flex">
                          <span className="text-orange-400 mr-2">•</span>
                          <span>{insight}</span>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="pt-4 border-t border-orange-500/20">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>Powered by</span>
                      <span className="text-xs font-medium bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">LLaMA 3.3</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="no-insights"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-48 text-center"
                >
                  <div>
                    <div className="bg-orange-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FaBrain className="text-orange-400/50" />
                    </div>
                    <p className="text-gray-300">Add more task data to receive personalized insights.</p>
                    <p className="text-sm mt-2 text-orange-400/70">We recommend at least 5 tasks.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Task Streak Tracker */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-md border border-orange-500/20 rounded-xl p-5 transition-all duration-300 lg:col-span-3 shadow-lg"
          whileHover={{ boxShadow: "0 8px 30px rgba(249, 115, 22, 0.07)", y: -2 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <div className="bg-orange-500/10 p-2 rounded-lg mr-3">
                <FaFire className="text-orange-400" />
              </div>
              <h2 className="text-lg font-medium text-white">Task Streak</h2>
            </div>
            {currentStreak > 0 && (
              <div 
                className="inline-flex bg-gradient-to-r from-orange-500/20 to-amber-600/20 text-orange-300 text-xs rounded-full px-3 py-1 border border-orange-500/20 items-center gap-1"
              >
                <FaFire className="text-amber-400" />
                <span>{currentStreak} day{currentStreak !== 1 ? 's' : ''} streak</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center sm:justify-between py-2">
            {streakData.map((day, index) => (
              <motion.div 
                key={index} 
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <div 
                  className={`w-10 h-10 rounded-md flex items-center justify-center 
                    ${day.hasCompletedTask 
                      ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white border border-orange-400/30 shadow-lg' 
                      : 'bg-gray-800 text-gray-500 border border-gray-700'} 
                    transition-all duration-300`}
                >
                  <span className="text-xs font-medium">{day.displayDate.split(' ')[1]}</span>
                </div>
                <span className="text-[10px] text-gray-400 mt-1">{day.displayDate.split(' ')[0]}</span>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-center text-orange-300/70 mt-4 bg-orange-500/5 rounded-lg py-2 border border-orange-500/10">
            Days when you completed at least one task in the past two weeks
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;