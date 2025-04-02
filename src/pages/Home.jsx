import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  
  useEffect(() => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    setIsLoggedIn(!!user);
    
    // Set loaded state faster for snappier appearance
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Optimized animation variants for snappy performance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: prefersReducedMotion ? 0 : 0.06, // Faster stagger
        duration: 0.3, // Faster transition
        ease: "easeOut"
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 15 }, // Reduced distance for snappier movement
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.25, // Faster animation
        ease: [0.25, 0.1, 0.25, 1] // Custom easing for snappy motion
      }
    }
  };
  
  const backgroundVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 0.1,
      transition: { duration: 0.8, ease: "easeOut" } // Faster background transition
    }
  };
  
  const gridItemVariants = {
    hidden: { opacity: 0, scale: 0.9 }, // Less scale difference for snappier effect
    visible: (custom) => ({
      opacity: 0.6 + Math.random() * 0.4,
      scale: 1,
      transition: { 
        duration: 0.4, // Faster animation
        delay: prefersReducedMotion ? 0 : custom * 0.01, // Much faster delay
        ease: "easeOut"
      }
    })
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="relative mt-16 min-h-[calc(100vh-4rem)] bg-[#0A0A0A] bg-gradient-to-br from-black via-gray-900 to-[#0F0F0F] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }} // Faster page fade-in
        key="home-page"
      >
        {/* Background Effects - Optimized animations */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px] -top-20 -left-20"
            initial={{ opacity: 0.3 }}
            animate={{ 
              scale: prefersReducedMotion ? 1 : [1, 1.03, 1], // Subtle movement
              opacity: prefersReducedMotion ? 0.4 : [0.3, 0.4, 0.3],
            }}
            transition={{ 
              duration: 8,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="absolute w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[120px] -bottom-20 -right-20"
            initial={{ opacity: 0.3 }}
            animate={{ 
              scale: prefersReducedMotion ? 1 : [1, 1.05, 1], // Subtle movement
              opacity: prefersReducedMotion ? 0.4 : [0.3, 0.5, 0.3],
            }}
            transition={{ 
              duration: 10,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.5
            }}
          />
          <motion.div
            className="absolute inset-0 opacity-10"
            initial="initial"
            animate="animate"
            variants={backgroundVariants}
          >
            {/* Grid Pattern with optimized performance */}
            <div className="absolute inset-0 grid grid-cols-8 md:grid-cols-12 gap-4 p-4">
              {Array.from({ length: prefersReducedMotion ? 48 : 96 }).map((_, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={gridItemVariants}
                  initial="hidden"
                  animate={isLoaded ? "visible" : "hidden"}
                  className="aspect-square border border-orange-500/10 rounded-lg backdrop-blur-sm"
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Hero Section with optimized animation flow */}
        <div className="relative">
          <motion.div 
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32"
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
          >
            <div className="text-center space-y-6"> {/* Reduced spacing for snappier feel */}
              {/* AI Badge */}
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r 
                  from-orange-500/10 to-amber-500/10 border border-orange-500/20 text-orange-400 
                  text-sm gap-2 backdrop-blur-sm"
                whileHover={{ 
                  scale: 1.03, // Subtle scale for snappier feedback
                  boxShadow: "0 0 15px rgba(251,146,60,0.25)",
                  transition: { duration: 0.15, ease: "easeOut" } // Ultra fast transition
                }}
              >
                <span className="relative flex h-2 w-2">
                  <motion.span 
                    className="absolute inline-flex h-full w-full rounded-full bg-orange-400"
                    animate={{ 
                      scale: prefersReducedMotion ? 1 : [1, 1.3, 1], // Reduced scale range
                      opacity: [0.7, 0.3, 0.7]
                    }}
                    transition={{
                      duration: 1.5, // Faster pulse
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"/>
                </span>
                <span className="font-medium">AI-Powered Productivity</span>
              </motion.div>

              {/* Heading - Optimized animation */}
              <motion.h1
                className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mx-auto"
                variants={itemVariants}
              >
                <motion.span 
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500"
                  animate={prefersReducedMotion ? {} : { 
                    backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
                  }}
                  transition={{ 
                    duration: 12, // Slower text animation doesn't impact snappiness
                    ease: "easeInOut", 
                    repeat: Infinity, 
                    repeatType: "reverse" 
                  }}
                  style={{ 
                    backgroundSize: '200% 100%',
                  }}
                >
                  Smart Task Management
                </motion.span>
                <span className="block text-white mt-2"> {/* Reduced spacing */}
                  Enhanced by AI
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                variants={itemVariants}
                className="mt-4 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto" // Reduced top margin
              >
                Experience the future of productivity with AI-powered task scheduling,
                smart prioritization, and intelligent workload balancing.
              </motion.p>

              {/* CTA Buttons - With snappier hover animations */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row justify-center gap-4 mt-8" // Reduced spacing
              >
                <SnappyButton
                  to={isLoggedIn ? "/dashboard" : "/signup"}
                  primary
                >
                  {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
                </SnappyButton>

                <SnappyButton
                  to="/privacy"
                  secondary
                >
                  Privacy Policy
                </SnappyButton>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Features Grid with optimized animations */}
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10" // Reduced padding
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }} // Faster transition
          viewport={{ once: true, margin: "-5%" }} // Earlier trigger for perceived speed
        >
          {/* Section Header */}
          <motion.div 
            className="text-center mb-12" // Reduced margin
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }} // Snappy custom easing
            viewport={{ once: true, margin: "-10%" }}
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-3 relative inline-block" // Reduced margin
              initial={{ opacity: 0, scale: 0.97 }} // Less scale for snappier animation
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }} // Faster transition
              viewport={{ once: true, margin: "-10%" }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500"
                style={{ backgroundSize: '200% 100%' }}
                animate={prefersReducedMotion ? {} : { 
                  backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
                }}
                transition={{ 
                  duration: 8, 
                  ease: "easeInOut", 
                  repeat: Infinity, 
                  repeatType: "reverse" 
                }}
              >
                AI-Powered Features
              </span>
              <motion.span
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 w-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                whileInView={{ width: "80%" }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }} // Snappier underline
                viewport={{ once: true }}
              />
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-400 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 10 }} // Less movement for snappier feel
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }} // Faster transition
              viewport={{ once: true }}
            >
              Experience the next generation of productivity tools crafted to transform how you manage your tasks and time.
            </motion.p>
          </motion.div>

          {/* Features Grid with optimized staggered animation */}
          <FeatureGrid prefersReducedMotion={prefersReducedMotion} />

          {/* Developer Info Section */}
          <motion.div
            className="mt-24 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-orange-500/20 backdrop-blur-sm">
              <motion.div 
                className="flex flex-col items-center space-y-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <img 
                  src="https://avatars.githubusercontent.com/u/69210117?v=4"
                  alt="Ayush Sharma"
                  className="w-20 h-20 rounded-full border-2 border-orange-500/30 shadow-lg shadow-orange-500/20"
                />
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                    Developed by Ayush Sharma
                  </h3>
                  <p className="text-gray-400 text-sm">Full Stack Developer & AI Enthusiast</p>
                  <a href="mailto:connect@ayush-sharma.in" className="text-orange-400/80 hover:text-orange-400 text-sm transition-colors duration-200">
                    connect@ayush-sharma.in
                  </a>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <a
                    href="https://cyberboyayush.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-1.5 rounded-lg border border-orange-500/20 hover:bg-orange-500/10"
                    >
                      Portfolio
                    </motion.div>
                  </a>
                  <a
                    href="https://github.com/cyberboyayush"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-1.5 rounded-lg border border-orange-500/20 hover:bg-orange-500/10"
                    >
                      GitHub
                    </motion.div>
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* CTA Button after Developer Info */}
          <motion.div 
            className="text-center mt-12 flex justify-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true, margin: "-10%" }}
          >
            <SnappyButton
              to={isLoggedIn ? "/dashboard" : "/signup"}
              primary
              large
            >
              {isLoggedIn ? "Go to Dashboard" : "Get Started With All Features"}
            </SnappyButton>
            <SnappyButton
              to={`mailto:connect@ayush-sharma.in`}
              secondary
              large
            >
              Contact Us
            </SnappyButton>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Optimized feature grid component for snappier rendering
const FeatureGrid = ({ prefersReducedMotion }) => {
  // Faster variants for feature grid
  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
        duration: 0.1,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-6" // Reduced gap
      variants={gridVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-5%" }} // Earlier trigger
    >
      <AIFeatureCard
        icon="🧠"
        title="Smart Prioritization"
        description="AI analyzes your tasks and suggests the optimal order based on deadlines, importance, and your working patterns."
        delay={0}
        color="orange"
        prefersReducedMotion={prefersReducedMotion}
      />
      <AIFeatureCard
        icon="⚡"
        title="Intelligent Scheduling"
        description="Let AI find the perfect time slots for your tasks based on your productivity patterns and calendar availability."
        delay={0.05}
        color="amber"
        prefersReducedMotion={prefersReducedMotion}
      />
      <AIFeatureCard
        icon="📊"
        title="Predictive Analytics"
        description="Get insights about your productivity trends with AI-powered analytics and visualizations of your work habits."
        delay={0.1}
        color="orange"
        prefersReducedMotion={prefersReducedMotion}
      />
      <AIFeatureCard
        icon="🔄"
        title="Adaptive Workflows"
        description="AI learns from your behaviors to create personalized workflow suggestions that evolve as your needs change."
        delay={0.15}
        color="amber"
        prefersReducedMotion={prefersReducedMotion}
      />
      <AIFeatureCard
        icon="🔍"
        title="Smart Search"
        description="Find tasks and events instantly with natural language search powered by advanced AI algorithms."
        delay={0.2}
        color="orange"
        prefersReducedMotion={prefersReducedMotion}
      />
      <AIFeatureCard
        icon="📆"
        title="Google Calendar Integration"
        description="Seamlessly sync your tasks and events with Google Calendar to keep all your schedules in perfect harmony."
        delay={0.25}
        color="amber"
        prefersReducedMotion={prefersReducedMotion}
      />
    </motion.div>
  );
};

// Snappy button component with optimized hover animations
const SnappyButton = ({ children, to, primary, secondary, large }) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div 
      whileHover={{ 
        scale: prefersReducedMotion ? 1 : 1.02, // Subtle scale for instant feedback
        y: prefersReducedMotion ? 0 : -2,
        transition: { 
          type: "spring", 
          stiffness: 500, // Higher stiffness for snappier response
          damping: 15,
          mass: 0.8 // Lower mass for faster movement
        }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.05 } // Ultra-fast response
      }}
      className="inline-block"
    >
      <Link 
        to={to}
        className={`${large ? 'px-10 py-4' : 'px-8 py-3.5'} font-semibold rounded-xl flex items-center justify-center gap-2
          transition-colors duration-150 
          ${primary ? 
            'bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-500 hover:to-amber-500 shadow-[0_0_20px_rgba(251,146,60,0.3)]' : 
            secondary ? 
              'bg-gray-800/50 text-white border border-orange-500/20 backdrop-blur-sm hover:bg-gray-800/70' :
              'bg-gray-800/50 text-white border border-gray-700'
          }`}
      >
        {children}
        <motion.span 
          className="inline-block"
          animate={prefersReducedMotion ? {} : { x: [0, 2, 0] }}
          transition={{ 
            duration: 1, 
            ease: "easeInOut", 
            repeat: Infinity,
            repeatType: "reverse", 
            repeatDelay: 0.5
          }}
        >→</motion.span>
      </Link>
    </motion.div>
  );
};

// Enhanced Feature Card with optimized animations
const AIFeatureCard = ({ icon, title, description, delay, color = "orange", prefersReducedMotion }) => {
  const gradientClass = 
    color === "amber" 
      ? "from-amber-500/10 to-orange-500/10 hover:border-amber-500/40" 
      : "from-orange-500/10 to-amber-500/10 hover:border-orange-500/40";

  // Optimized variants for snappier animations
  const cardVariants = {
    hidden: { opacity: 0, y: 20 }, // Reduced distance
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3, // Faster animation
        delay: prefersReducedMotion ? 0 : delay * 0.5, // Half the delay
        ease: [0.25, 0.1, 0.25, 1], // Custom easing for snappiness
        when: "beforeChildren",
        staggerChildren: 0.05 // Faster stagger
      }
    },
    hover: {
      y: -5, // Reduced movement for snappier hover
      boxShadow: "0 10px 30px -10px rgba(251,146,60,0.3)", 
      transition: { 
        type: "spring", 
        stiffness: 500, // Higher stiffness
        damping: 15,
        mass: 0.8 // Lower mass
      }
    }
  };
  
  // Content animations
  const contentVariants = {
    hidden: { opacity: 0, y: 8 }, // Reduced distance
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2 } // Faster animation
    }
  };
  
  // Icon animations
  const iconVariants = {
    hidden: { scale: 0.9, opacity: 0 }, // Less scale difference
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.25, // Faster animation
        type: "spring",
        stiffness: 500,
        damping: 15
      }
    },
    hover: {
      scale: 1.08, // Less scale for quicker animation
      rotate: [0, -3, 3, -3, 0], // Reduced rotation for snappier feel
      transition: { duration: 0.4, ease: "easeInOut" }
    }
  };

  return (
    <motion.div
      className={`group p-5 md:p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 
        transition-colors duration-150 relative overflow-hidden h-full flex flex-col`} // Reduced padding
      variants={cardVariants}
      whileHover="hover"
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-100`}
        transition={{ duration: 0.2, ease: "easeOut" }} // Faster transition
      />
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Icon with animated container */}
        <motion.div 
          className="mb-4 relative" // Reduced margin
          variants={contentVariants}
        >
          <motion.div
            className={`w-12 h-12 flex items-center justify-center text-xl bg-gradient-to-br 
              ${color === "amber" ? 'from-amber-500/20 to-orange-400/20' : 'from-orange-500/20 to-amber-400/20'} 
              rounded-xl border border-orange-500/30`} // Smaller icon
            variants={iconVariants}
          >
            <motion.span 
              className="text-2xl" // Smaller icon
              animate={prefersReducedMotion ? {} : { scale: [1, 1.05, 1] }} // Reduced scale
              transition={{ 
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
                delay: Math.random()
              }}
            >{icon}</motion.span>
          </motion.div>
        </motion.div>
        
        {/* Content with staggered animation */}
        <motion.h3 
          className="text-lg font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors duration-150" // Reduced font size & margin
          variants={contentVariants}
        >{title}</motion.h3>
        <motion.p 
          className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-150" // Smaller text
          variants={contentVariants}
        >{description}</motion.p>
      </div>
    </motion.div>
  );
};

export default Home;