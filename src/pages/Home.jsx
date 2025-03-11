import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    setIsLoggedIn(!!user);
  }, []);

  return (
    <div className="relative mt-16 min-h-[calc(100vh-4rem)] bg-[#0A0A0A] bg-gradient-to-br from-black via-gray-900 to-[#0F0F0F] overflow-hidden">
      {/* Background Effects - Updated with darker colors */}
      <div className="absolute inset-0">
        <div className="absolute w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px] 
          -top-20 -left-20 animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[120px] 
          -bottom-20 -right-20 animate-pulse delay-1000"></div>
        <motion.div
          className="absolute inset-0 opacity-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2 }}
        >
          {/* Enhanced Grid Pattern */}
          <div className="absolute inset-0 grid grid-cols-8 md:grid-cols-12 gap-4 p-4">
            {Array.from({ length: 96 }).map((_, i) => (
              <motion.div
                key={i}
                className="aspect-square border border-orange-500/10 rounded-lg backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.01 }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* AI Badge - Updated with orange theme */}
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r 
                from-orange-500/10 to-amber-500/10 border border-orange-500/20 text-orange-400 
                text-sm gap-2 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="font-medium">AI-Powered Productivity</span>
            </motion.div>

            {/* Heading - Updated with orange gradient */}
            <motion.h1
              className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mx-auto"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="block text-transparent bg-clip-text bg-gradient-to-r 
                from-orange-400 via-amber-400 to-orange-500">
                Smart Task Management
              </span>
              <span className="block text-white mt-4">
                Enhanced by AI
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              className="mt-6 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Experience the future of productivity with AI-powered task scheduling,
              smart prioritization, and intelligent workload balancing.
            </motion.p>

            {/* CTA Buttons - Updated with orange theme */}
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4 mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to={isLoggedIn ? "/dashboard" : "/signup"}
                  className="group px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-xl 
                    hover:from-orange-500 hover:to-amber-500 transition-all duration-200 
                    shadow-[0_0_30px_rgba(251,146,60,0.4)] hover:shadow-[0_0_40px_rgba(251,146,60,0.5)]
                    flex items-center justify-center gap-2"
                >
                  {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/about"
                  className="px-8 py-4 bg-gray-800/50 text-white font-semibold rounded-xl 
                    backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-200 
                    border border-orange-500/20 flex items-center justify-center gap-2"
                >
                  Learn More
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Revamped Features Grid */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 mb-4"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            AI-Powered Features
          </motion.h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Experience the next generation of productivity tools crafted to transform how you manage your tasks and time.
          </p>
        </motion.div>

        {/* Features Grid - 2x3 on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <AIFeatureCard
            icon="🧠"
            title="Smart Prioritization"
            description="AI analyzes your tasks and suggests the optimal order based on deadlines, importance, and your working patterns."
            delay={0}
            color="orange"
          />
          <AIFeatureCard
            icon="⚡"
            title="Intelligent Scheduling"
            description="Let AI find the perfect time slots for your tasks based on your productivity patterns and calendar availability."
            delay={0.1}
            color="amber"
          />
          <AIFeatureCard
            icon="📊"
            title="Predictive Analytics"
            description="Get insights about your productivity trends with AI-powered analytics and visualizations of your work habits."
            delay={0.2}
            color="orange"
          />
          <AIFeatureCard
            icon="🔄"
            title="Adaptive Workflows"
            description="AI learns from your behaviors to create personalized workflow suggestions that evolve as your needs change."
            delay={0.3}
            color="amber"
          />
          <AIFeatureCard
            icon="🔍"
            title="Smart Search"
            description="Find tasks and events instantly with natural language search powered by advanced AI algorithms."
            delay={0.4}
            color="orange"
          />
          <AIFeatureCard
            icon="📆"
            title="Google Calendar Integration"
            description="Seamlessly sync your tasks and events with Google Calendar to keep all your schedules in perfect harmony."
            delay={0.5}
            color="amber"
          />
        </div>

        {/* CTA Button */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Link 
              to={isLoggedIn ? "/dashboard" : "/signup"}
              className="px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-xl 
                hover:from-orange-500 hover:to-amber-500 transition-all duration-200 
                shadow-[0_0_30px_rgba(251,146,60,0.4)] hover:shadow-[0_0_40px_rgba(251,146,60,0.5)]
                flex items-center justify-center gap-2 group"
            >
              {isLoggedIn ? "Go to Dashboard" : "Get Started With All Features"}
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Enhanced AIFeatureCard with hover animations and interactive elements
const AIFeatureCard = ({ icon, title, description, delay, color = "orange" }) => {
  const gradientClass = 
    color === "amber" 
      ? "from-amber-500/10 to-orange-500/10 hover:border-amber-500/50" 
      : "from-orange-500/10 to-amber-500/10 hover:border-orange-500/50";

  return (
    <motion.div
      className={`group p-6 md:p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 
        transition-all duration-300 relative overflow-hidden h-full flex flex-col`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
      viewport={{ once: true }}
      whileHover={{ y: -5, boxShadow: "0 10px 40px -15px rgba(251,146,60,0.3)" }}
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Icon with animated container */}
        <div className="mb-6 relative">
          <motion.div
            className={`w-14 h-14 flex items-center justify-center text-2xl bg-gradient-to-br 
              ${color === "amber" ? 'from-amber-500/20 to-orange-400/20' : 'from-orange-500/20 to-amber-400/20'} 
              rounded-2xl border border-orange-500/30`}
            whileHover={{ 
              scale: 1.1, 
              rotate: [0, -5, 5, -5, 0],
              transition: { duration: 0.5, type: "spring" }
            }}
          >
            <span className="text-3xl">{icon}</span>
          </motion.div>
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-orange-400 transition-colors">{title}</h3>
        <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{description}</p>
      </div>
    </motion.div>
  );
};

export default Home;