import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FaGoogle, FaMicrosoft, FaShopify, FaAirbnb } from "react-icons/fa";
import { SiFacebook } from "react-icons/si"; // Changed from SiNike to SiFacebook for Meta

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const prefersReducedMotion = useReducedMotion();
  const faqRef = useRef(null);
  const featuresRef = useRef(null);
  
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

  const scrollToFaq = () => {
    faqRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        {/* Background Effects - Enhanced with additional elements */}
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
          {/* New floating gradient element */}
          <motion.div 
            className="absolute w-[300px] h-[300px] bg-orange-500/5 rounded-full blur-[80px] top-[40%] left-[30%] hidden md:block"
            animate={{ 
              y: prefersReducedMotion ? 0 : [0, -15, 0],
              opacity: prefersReducedMotion ? 0.3 : [0.2, 0.3, 0.2], 
            }}
            transition={{ 
              duration: 12,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
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

        {/* Hero Section - Enhanced with more visual appeal */}
        <div className="relative">
          <motion.div 
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28"
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
          >
            {/* Decorative elements */}
            <motion.div 
              className="absolute top-10 md:top-20 right-10 md:right-20 w-20 h-20 md:w-32 md:h-32 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 blur-2xl"
              animate={{ 
                scale: prefersReducedMotion ? 1 : [1, 1.2, 1],
                opacity: prefersReducedMotion ? 0.5 : [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
            />
            <motion.div 
              className="absolute -top-10 -left-10 w-36 h-36 md:w-52 md:h-52 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-3xl"
              animate={{ 
                scale: prefersReducedMotion ? 1 : [1, 1.15, 1],
                opacity: prefersReducedMotion ? 0.4 : [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 9, repeat: Infinity, repeatType: "reverse", delay: 1 }}
            />
            
            {/* Floating graphic elements */}
            <motion.div 
              className="hidden md:block absolute top-14 right-32 w-16 h-16 bg-gradient-to-br from-orange-500/30 to-amber-500/30 rounded-xl transform -rotate-12 border border-orange-500/20 backdrop-blur-sm"
              initial={{ y: 0, rotate: -12, opacity: 0 }}
              animate={{ 
                y: [0, -10, 0], 
                rotate: [-12, -5, -12],
                opacity: 0.7 
              }}
              transition={{ duration: 6, repeat: Infinity, delay: 1 }}
            >
              <div className="w-full h-full flex items-center justify-center text-white text-2xl">✨</div>
            </motion.div>
            
            <motion.div
              className="hidden md:block absolute bottom-20 left-32 w-20 h-20 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full border border-amber-500/20 backdrop-blur-sm"
              initial={{ y: 0, opacity: 0 }}
              animate={{ 
                y: [0, 15, 0], 
                opacity: 0.6
              }}
              transition={{ duration: 7, repeat: Infinity, delay: 0.5 }}
            >
              <div className="w-full h-full flex items-center justify-center text-white text-3xl">🚀</div>
            </motion.div>

            <div className="flex flex-col items-center">
              {/* Hero content with enhanced animations */}
              <div className="text-center space-y-8 max-w-4xl mx-auto relative z-10">
                {/* Enhanced AI Badge */}
                <motion.div
                  variants={itemVariants}
                  className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r 
                    from-orange-500/15 to-amber-500/15 border border-orange-500/30 text-orange-400 
                    text-sm font-medium gap-2.5 backdrop-blur-sm shadow-lg shadow-orange-500/10"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 20px rgba(251,146,60,0.3)",
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                >
                  <span className="relative flex h-3 w-3">
                    <motion.span 
                      className="absolute inline-flex h-full w-full rounded-full bg-orange-400"
                      animate={{ 
                        scale: prefersReducedMotion ? 1 : [1, 1.5, 1],
                        opacity: [0.8, 0.2, 0.8]
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"/>
                  </span>
                  <span>Powered by LLaMA 3.3</span>
                </motion.div>

                {/* Enhanced Heading with better animations and text shadow */}
                <motion.h1
                  className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0, 
                      transition: { 
                        duration: 0.6,
                        ease: [0.25, 0.1, 0.25, 1]
                      } 
                    }
                  }}
                >
                  <motion.span 
                    className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 drop-shadow-sm"
                    animate={prefersReducedMotion ? {} : { 
                      backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
                    }}
                    transition={{ 
                      duration: 12,
                      ease: "easeInOut", 
                      repeat: Infinity, 
                      repeatType: "reverse" 
                    }}
                    style={{ 
                      backgroundSize: '200% 100%',
                      textShadow: '0 4px 30px rgba(249, 115, 22, 0.2)'
                    }}
                  >
                    Smart Task Management
                  </motion.span>
                  <motion.span 
                    className="block text-white mt-3 text-4xl sm:text-5xl md:text-6xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    Enhanced by AI
                  </motion.span>
                </motion.h1>

                {/* Enhanced Description with better styling */}
                <motion.p
                  variants={itemVariants}
                  className="mt-6 text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light"
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
                >
                  Experience the future of productivity with AI-powered task scheduling,
                  smart prioritization, and intelligent workload balancing.
                </motion.p>

                {/* Enhanced secondary tagline */}
                <motion.p 
                  className="text-lg text-orange-400/90 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  Sync with Google Calendar for seamless integration
                </motion.p>

                {/* Enhanced CTA Buttons with better design */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-wrap justify-center gap-5 mt-10"
                >
                  <SuperSnappyButton
                    to={isLoggedIn ? "/dashboard" : "/signup"}
                    primary
                    large
                  >
                    {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
                  </SuperSnappyButton>

                  <SuperSnappyButton
                    to="/privacy"
                    secondary
                    large
                  >
                    Privacy Policy
                  </SuperSnappyButton>
                </motion.div>
                
                {/* Enhanced Trust badges */}
                <motion.div 
                  variants={itemVariants}
                  className="mt-14 pt-4 border-t border-gray-800/50"
                >
                  <motion.p 
                    className="text-sm text-gray-400 mb-4 uppercase tracking-wider font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    Trusted Technology
                  </motion.p>
                  <motion.div 
                    className="flex items-center justify-center gap-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <motion.div 
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-800/80 to-gray-800/60 rounded-lg backdrop-blur-md border border-gray-700/50 shadow-lg"
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    >
                      <FcGoogle className="w-5 h-5" />
                      <span className="text-sm text-gray-300 font-medium">Verified by Google</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-800/80 to-gray-800/60 rounded-lg backdrop-blur-md border border-gray-700/50 shadow-lg"
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    >
                      <MetaIcon className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-gray-300 font-medium">LLaMA 3.3 Powered</span>
                    </motion.div>
                  </motion.div>
                </motion.div>
                
                {/* Scroll indicator removed */}
              </div>
            </div>
            
            {/* Mobile trust badges - replaced by the enhanced version above */}
            {/* This section can be removed as it's now combined in the main section */}
          </motion.div>
        </div>
        
        {/* Trusted By Section */}
        <motion.div 
          className="relative z-10 py-12 bg-gradient-to-r from-gray-900 via-black to-gray-900 mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500">Trusted by teams from</p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
              {[
                { name: 'Google', icon: <FaGoogle className="text-red-500" /> }, 
                { name: 'Microsoft', icon: <FaMicrosoft className="text-blue-500" /> }, 
                { name: 'Shopify', icon: <FaShopify className="text-green-500" /> }, 
                { name: 'Airbnb', icon: <FaAirbnb className="text-red-400" /> }, 
                { name: 'Meta', icon: <SiFacebook className="text-blue-600" /> } // Replaced Nike with Meta
              ].map((company) => (
                <div key={company.name} className="opacity-50 hover:opacity-80 transition-opacity flex items-center gap-3">
                  <span className="text-xl">{company.icon}</span>
                  <span className="text-xl font-semibold text-gray-400">{company.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          className="relative z-10 py-20 overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <motion.span 
                className="inline-block text-sm font-medium text-orange-500 mb-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20"
                whileHover={{ scale: 1.05 }}
              >
                Simple & Intuitive
              </motion.span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                How <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Effisense</span> Works
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Experience seamless productivity with our AI-powered tools that adapt to your workflow
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Connect Your Calendar",
                  description: "Link your Google Calendar to keep everything in sync and let AI find optimal scheduling times",
                  icon: "🔄"
                },
                {
                  step: "02",
                  title: "Create AI-Enhanced Tasks",
                  description: "Add tasks that our AI will automatically organize, prioritize and suggest optimal time slots for",
                  icon: "✨"
                },
                {
                  step: "03",
                  title: "Get Smart Insights",
                  description: "Receive AI-powered analytics about your productivity and suggestions for improvement",
                  icon: "📊"
                }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="relative bg-gray-800/30 backdrop-blur-md rounded-2xl p-6 border border-orange-500/10 hover:border-orange-500/30 transition-all group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="absolute -top-4 -right-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-orange-500/20">
                      {item.step}
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-orange-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-400">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Features Grid - Enhanced with better animations */}
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          viewport={{ once: true, margin: "-5%" }}
          ref={featuresRef}
        >
          {/* Section Header - Enhanced design with badge on top */}
          <motion.div 
            className="text-center mb-16 relative"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true, margin: "-10%" }}
          >
            <motion.div
              className="mb-4 flex justify-center" // Added a container div with flex and margin-bottom
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true }}
            >
              <motion.span 
                className="block text-sm font-medium text-orange-500 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 shadow-lg shadow-orange-500/10"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                Feature-Rich Platform
              </motion.span>
            </motion.div>
            
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-3 relative inline-block text-white"
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
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
              
              {/* Animated underline */}
              <motion.span
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 w-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                initial={{ width: "0%" }}
                whileInView={{ width: "80%" }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
                viewport={{ once: true }}
              />
            </motion.h2>
            
            {/* ...existing code... */}
          </motion.div>

          {/* Features Grid with enhanced animations - no more filtering */}
          <EnhancedFeatureGrid prefersReducedMotion={prefersReducedMotion} />
        </motion.div>
        
        {/* Integrations Section */}
        <motion.div 
          className="relative z-10 py-20 bg-gradient-to-b from-black/0 via-orange-950/5 to-black/0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <motion.span 
                className="inline-block text-sm font-medium text-orange-500 mb-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20"
                whileHover={{ scale: 1.05 }}
              >
                Seamless Connections
              </motion.span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Powerful <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Integrations</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Connect with your favorite tools and enhance your productivity experience
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Google Calendar Integration */}
              <motion.div 
                className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center text-3xl p-3">
                    <GoogleIcon className="w-full h-full text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-white">Google Calendar</h3>
                      <span className="text-xs font-medium px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                        Verified
                      </span>
                    </div>
                    <p className="text-gray-400 mb-4">
                      Sync your tasks and events with Google Calendar for a unified schedule. Our one-way sync ensures your Effisense tasks appear in your calendar automatically.
                    </p>
                    <ul className="space-y-2 mb-4">
                      {["Auto-sync tasks & events", "Conflict detection", "Smart time blocking"].map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                          <span className="text-blue-400">✓</span> {feature}
                        </li>
                      ))}
                    </ul>
                    <SnappyButton
                      to="/settings#google-calendar"
                      className="!bg-blue-500/20 hover:!bg-blue-500/30 border-blue-500/30 text-blue-400"
                    >
                      Connect Calendar
                    </SnappyButton>
                  </div>
                </div>
              </motion.div>
              
              {/* LLaMA 3.3 Integration */}
              <motion.div 
                className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center text-3xl p-3">
                    <MetaIcon className="w-full h-full text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">LLaMA 3.3 Powered</h3>
                    <p className="text-gray-400 mb-4">
                      Experience advanced AI capabilities powered by LLaMA 3.3. Our AI rewrites tasks, summarizes descriptions, and helps you plan your week more efficiently.
                    </p>
                    <ul className="space-y-2 mb-4">
                      {["Task rewriting & enhancement", "Smart time allocation", "Weekly planning assistance"].map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                          <span className="text-orange-400">✓</span> {feature}
                        </li>
                      ))}
                    </ul>
                    <SnappyButton
                      to="/dashboard"
                      className="!bg-orange-500/20 hover:!bg-orange-500/30 border-orange-500/30"
                    >
                      Explore AI Features
                    </SnappyButton>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Testimonials Section */}
        <motion.div 
          className="relative z-10 py-20 overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            {/* Background decorations */}
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-72 h-72 bg-orange-500/5 rounded-full filter blur-3xl"></div>
            <div className="absolute top-1/4 right-0 transform -translate-y-1/2 w-80 h-80 bg-amber-500/5 rounded-full filter blur-3xl"></div>
            
            <motion.div 
              className="text-center mb-16 relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <motion.span 
                className="inline-block text-sm font-medium text-orange-500 mb-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20"
                whileHover={{ scale: 1.05 }}
              >
                User Testimonials
              </motion.span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                What <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">People Say</span> About Us
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Join thousands of satisfied users who have transformed their productivity
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Alex Chen",
                  role: "Product Manager",
                  image: "https://randomuser.me/api/portraits/men/32.jpg",
                  quote: "Effisense has completely transformed how I plan my week. The AI suggestions are surprisingly accurate!"
                },
                {
                  name: "Sarah Johnson",
                  role: "UX Designer",
                  image: "https://randomuser.me/api/portraits/women/44.jpg",
                  quote: "I love how seamlessly it integrates with my Google Calendar. The AI task prioritization saves me hours every week."
                },
                {
                  name: "Michael Torres",
                  role: "Software Engineer",
                  image: "https://randomuser.me/api/portraits/men/67.jpg",
                  quote: "The smart scheduling has helped me maintain a much better work-life balance. I can't imagine going back!"
                }
              ].map((testimonial, index) => (
                <motion.div 
                  key={index}
                  className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/10 relative group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, borderColor: "rgba(249, 115, 22, 0.4)" }}
                >
                  <div className="absolute -top-3 -left-3 text-4xl opacity-30 text-orange-500">"</div>
                  <div className="absolute -bottom-3 -right-3 text-4xl opacity-30 text-orange-500">"</div>
                  
                  <p className="text-gray-300 mb-6 relative z-10">
                    {testimonial.quote}
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 overflow-hidden rounded-full border-2 border-orange-500/30">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white group-hover:text-orange-400 transition-colors">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div 
          className="relative z-10 py-20 bg-gradient-to-b from-black/0 via-orange-950/5 to-black/0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          ref={faqRef}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <motion.span 
                className="inline-block text-sm font-medium text-orange-500 mb-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20"
                whileHover={{ scale: 1.05 }}
              >
                Have Questions?
              </motion.span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Questions</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Find answers to common questions about Effisense and how it can help you
              </p>
            </motion.div>

            <div className="space-y-4">
              {[
                {
                  question: "What is Effisense?",
                  answer: "Effisense is a smart productivity platform that helps you manage tasks, take notes, and plan your week — all enhanced by AI and synced with Google Calendar."
                },
                {
                  question: "How does AI help me stay productive?",
                  answer: "Our AI (powered by LLaMA 3.3) rewrites messy task titles, summarizes long descriptions, suggests smart time slots, and can even generate your weekly plan — so you spend less time planning and more time doing."
                },
                {
                  question: "Can Effisense sync with my Google Calendar?",
                  answer: "Yes! Effisense supports one-way sync from Effisense to Google Calendar. Tasks you create or update in Effisense will automatically appear in your calendar."
                },
                {
                  question: "Is my data private and secure?",
                  answer: "Absolutely. Your data is encrypted and never used for AI training. You can revoke Google Calendar access anytime, export your tasks, or delete your account — full control, always."
                },
                {
                  question: "What makes Effisense different from other task managers?",
                  answer: "Effisense is built for modern workflows — with AI-assisted features, calendar sync, rich note support, and a clean, distraction-free UI that works across devices."
                },
                {
                  question: "Is Effisense free to use?",
                  answer: "Effisense is currently free to use. Premium features like AI-generated weekly reports and advanced analytics may be offered later."
                },
                {
                  question: "Can I use Effisense on mobile?",
                  answer: "Yes! The app is fully responsive and a PWA version is coming soon so you can install it on your phone like a native app."
                },
                {
                  question: "Can I suggest a feature or give feedback?",
                  answer: "Of course! We're actively building and improving Effisense. Use the feedback form or email us directly via the Get in Touch section."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  className={`border border-orange-500/20 rounded-xl overflow-hidden transition-all duration-200 ${
                    activeFaq === index ? "bg-orange-500/5" : "bg-gray-800/30"
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
                  viewport={{ once: true, margin: "-10%" }}
                  layout
                >
                  <button
                    className="w-full px-6 py-4 flex justify-between items-center text-left"
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  >
                    <span className="font-semibold text-white text-lg">{faq.question}</span>
                    <motion.span
                      animate={{ rotate: activeFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-orange-500 text-xl"
                    >
                      ↓
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {activeFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-5 text-gray-300 border-t border-orange-500/10">
                          <p className="pt-4">{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Final CTA Section - Fixed to ensure all text is visible */}
        <motion.div
          className="relative z-10 py-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Simplified background to ensure text is visible */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600/40 via-amber-600/25 to-orange-700/30 border border-orange-500/40 shadow-2xl">
              {/* Simplified background elements */}
              <motion.div 
                className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/30 to-amber-500/0 rounded-full filter blur-3xl"
                animate={{ 
                  scale: prefersReducedMotion ? 1 : [1, 1.15, 1],
                  opacity: [0.4, 0.6, 0.4],
                }}
                transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }}
              />
              
              <div className="relative py-16 px-6 lg:px-8 text-center z-10">
                {/* Simplified heading with all text visible */}
                <motion.div className="mb-8 max-w-4xl mx-auto">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                    Ready to Transform Your{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-300">
                      Productivity?
                    </span>
                  </h2>
                  
                  {/* Simple underline that's always visible */}
                  <div className="h-1 w-64 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mx-auto"></div>
                </motion.div>
                
                {/* Description text */}
                <motion.p
                  className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto mb-10"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Join thousands of users who are already maximizing their efficiency with our{' '}
                  <span className="text-orange-300 font-medium">
                    AI-powered platform
                  </span>
                </motion.p>
                
                {/* CTA buttons with simpler, more reliable styling */}
                <motion.div
                  className="flex flex-wrap justify-center gap-6"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  {/* Primary button */}
                  <Link
                    to={isLoggedIn ? "/dashboard" : "/signup"}
                    className="px-8 py-3.5 font-semibold rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg hover:from-orange-500 hover:to-amber-500 transition-all flex items-center gap-2"
                  >
                    <span>{isLoggedIn ? "Go to Dashboard" : "Get Started Free"}</span>
                    <span className="inline-block">→</span>
                  </Link>
                  
                  {/* Secondary button */}
                  <Link
                    to="/about-us"
                    className="px-8 py-3.5 font-semibold rounded-xl bg-gray-800/70 border border-orange-500/30 text-white hover:bg-gray-800/90 hover:border-orange-500/50 transition-all flex items-center gap-2"
                  >
                    <span>About Us</span>
                    <span className="inline-block">→</span>
                  </Link>
                </motion.div>
                
                {/* Simple footer text */}
                <p className="text-sm text-gray-300 mt-8 flex items-center justify-center gap-2">
                  <span>✓</span>
                  Ai Powered
                  <span className="mx-2">•</span>
                  <span>✓</span>
                  Free To Use
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        
      </motion.div>
    </AnimatePresence>
  );
};

// Enhanced feature grid component - no more filtering
const EnhancedFeatureGrid = ({ prefersReducedMotion }) => {
  // Faster variants for feature grid
  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: prefersReducedMotion ? 0 : 0.08, // Increased staggering for more visible effect
        duration: 0.1,
        ease: "easeOut"
      }
    }
  };

  // Feature data - all features are shown now, no categories needed
  const features = [
    {
      icon: "🧠",
      title: "Smart Prioritization",
      description: "AI analyzes your tasks and suggests the optimal order based on deadlines, importance, and your working patterns.",
      highlight: true
    },
    {
      icon: "⚡",
      title: "Intelligent Scheduling",
      description: "Let AI find the perfect time slots for your tasks based on your productivity patterns and calendar availability.",
      highlight: false
    },
    {
      icon: "📊",
      title: "Predictive Analytics",
      description: "Get insights about your productivity trends with AI-powered analytics and visualizations of your work habits.",
      highlight: true
    },
    {
      icon: "🔄",
      title: "Adaptive Workflows",
      description: "AI learns from your behaviors to create personalized workflow suggestions that evolve as your needs change.",
      highlight: false
    },
    {
      icon: "🔍",
      title: "Smart Search",
      description: "Find tasks and events instantly with natural language search powered by advanced AI algorithms.",
      highlight: true
    },
    {
      icon: "📆",
      title: "Google Calendar Integration",
      description: "Seamlessly sync your tasks and events with Google Calendar to keep all your schedules in perfect harmony.",
      highlight: false
    },
  ];

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" // Increased gap
      variants={gridVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-5%" }}
    >
      {features.map((feature, index) => (
        <EnhancedFeatureCard
          key={index}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          delay={index * 0.1}
          color={index % 2 === 0 ? "orange" : "amber"}
          highlight={feature.highlight}
          prefersReducedMotion={prefersReducedMotion}
        />
      ))}
    </motion.div>
  );
};

// Enhanced Feature Card with improved animations
const EnhancedFeatureCard = ({ icon, title, description, delay, color = "orange", highlight = false, prefersReducedMotion }) => {
  const gradientClass = 
    color === "amber" 
      ? "from-amber-500/10 to-orange-500/10 hover:border-amber-500/40" 
      : "from-orange-500/10 to-amber-500/10 hover:border-orange-500/40";

  // Enhanced variants for more impressive animations
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.5,
        delay: prefersReducedMotion ? 0 : delay * 0.5,
        ease: [0.25, 0.1, 0.25, 1],
        when: "beforeChildren",
        staggerChildren: 0.08
      }
    },
    hover: {
      y: -10, // More pronounced lift
      boxShadow: "0 15px 30px -10px rgba(251,146,60,0.3)", 
      transition: { 
        type: "spring", 
        stiffness: 500,
        damping: 15,
        mass: 0.8
      }
    }
  };
  
  // Enhanced content animations
  const contentVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };
  
  // Enhanced icon animations
  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0, rotate: -10 },
    visible: { 
      scale: 1, 
      opacity: 1,
      rotate: 0,
      transition: { 
        duration: 0.4,
        type: "spring",
        stiffness: 500,
        damping: 15
      }
    },
    hover: {
      scale: 1.15, // More pronounced scale
      rotate: [0, -5, 5, -3, 0], // More dynamic rotation
      transition: { duration: 0.6, ease: "easeInOut" }
    }
  };

  return (
    <motion.div
      className={`group p-6 md:p-7 rounded-xl bg-gray-800/50 backdrop-blur-sm border ${highlight ? 'border-orange-500/30' : 'border-gray-700/50'} 
        transition-all duration-150 relative overflow-hidden h-full flex flex-col ${highlight ? 'shadow-lg shadow-orange-500/10' : ''}`}
      variants={cardVariants}
      whileHover="hover"
    >
      {/* Enhanced hover gradient effect */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-100`}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      
      {/* New spotlight effect on hover */}
      <motion.div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.06) 0%, transparent 60%)',
        }}
        transition={{ duration: 0.2 }}
        whileHover={{
          opacity: 1,
        }}
      />
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Icon with improved animated container */}
        <motion.div 
          className="mb-5 relative"
          variants={contentVariants}
        >
          <motion.div
            className={`w-14 h-14 flex items-center justify-center text-xl bg-gradient-to-br 
              ${color === "amber" ? 'from-amber-500/30 to-orange-400/30' : 'from-orange-500/30 to-amber-400/30'} 
              rounded-xl border border-orange-500/30`}
            variants={iconVariants}
          >
            <motion.span 
              className="text-3xl" // Increased size
              animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1], rotate: [0, 2, 0] }}
              transition={{ 
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
                delay: Math.random()
              }}
            >{icon}</motion.span>
          </motion.div>
          
          {/* Decorative element */}
          {highlight && (
            <motion.span
              className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          )}
        </motion.div>
        
        {/* Content with enhanced animations */}
        <motion.h3 
          className={`text-xl font-semibold text-white mb-3 group-hover:text-orange-400 transition-colors duration-150 
            ${highlight ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500' : ''}`}
          variants={contentVariants}
        >{title}</motion.h3>
        
        <motion.p 
          className="text-base text-gray-400 group-hover:text-gray-300 transition-colors duration-150"
          variants={contentVariants}
        >{description}</motion.p>
      </div>
    </motion.div>
  );
};

// Enhanced Snappy button with better animations
const SnappyButton = ({ children, to, primary, secondary, large, action, className = "", enhanced = false }) => {
  const prefersReducedMotion = useReducedMotion();
  
  const buttonContent = (
    <motion.div 
      whileHover={{ 
        scale: prefersReducedMotion ? 1 : enhanced ? 1.04 : 1.02, // More pronounced scale for enhanced buttons
        y: prefersReducedMotion ? 0 : enhanced ? -4 : -2, // More lift for enhanced buttons
        transition: { 
          type: "spring", 
          stiffness: 500,
          damping: 15,
          mass: 0.8
        }
      }}
      whileTap={{ 
        scale: 0.97,
        transition: { duration: 0.05 }
      }}
      className="inline-block"
    >
      <div 
        className={`${large ? 'px-8 py-3.5' : 'px-6 py-2.5'} font-semibold rounded-xl flex items-center justify-center gap-2
          transition-all duration-150 
          ${primary ? 
            `bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-500 hover:to-amber-500 
            ${enhanced ? 'shadow-xl shadow-orange-600/30' : 'shadow-lg shadow-orange-600/20'}` : 
            secondary ? 
              `bg-gray-800/50 text-white border border-orange-500/20 backdrop-blur-sm hover:bg-gray-800/70 hover:border-orange-500/40 
              ${enhanced ? 'shadow-lg shadow-orange-500/5' : ''}` :
              'bg-gray-800/50 text-white border border-gray-700 hover:border-gray-500'
          } ${className}`}
      >
        {children}
        <motion.span 
          className="inline-block"
          animate={prefersReducedMotion ? {} : 
            enhanced ? 
              { x: [0, 4, 0], opacity: [1, 0.7, 1] } : // Enhanced animation
              { x: [0, 2, 0] }
          }
          transition={{ 
            duration: enhanced ? 1.5 : 1, 
            ease: "easeInOut", 
            repeat: Infinity,
            repeatType: "reverse", 
            repeatDelay: enhanced ? 0.2 : 0.5
          }}
        >→</motion.span>
      </div>
    </motion.div>
  );

  if (action) {
    return (
      <button onClick={action} className="appearance-none">
        {buttonContent}
      </button>
    );
  }
  
  return <Link to={to}>{buttonContent}</Link>;
};

// Icon components
const GoogleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
  </svg>
);

// Meta icon for LLaMA 3.3
const MetaIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM9.5 16.5L16.5 12L9.5 7.5V16.5Z" />
  </svg>
);

// New SuperSnappyButton with dramatically enhanced animations
const SuperSnappyButton = ({ children, to, primary, secondary, large, action }) => {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  
  const buttonContent = (
    <motion.div 
      className="relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ 
        scale: prefersReducedMotion ? 1 : 1.05,
        y: prefersReducedMotion ? 0 : -5,
        transition: { 
          type: "spring", 
          stiffness: 400,
          damping: 10,
          mass: 0.6
        }
      }}
      whileTap={{ 
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.span
            className={`absolute inset-0 ${primary ? 'bg-orange-500/20' : 'bg-gray-700/30'} rounded-xl blur-md`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.15 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>
      
      <div 
        className={`
          ${large ? 'px-10 py-4' : 'px-8 py-3'} 
          relative z-10 font-semibold rounded-xl flex items-center justify-center gap-3
          transition-all duration-300 
          ${primary ? 
            'bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-size-200 text-white shadow-xl shadow-orange-600/30' : 
            secondary ? 
              'bg-gray-800/80 text-white border border-orange-500/30 backdrop-blur-sm hover:border-orange-500/70 shadow-lg shadow-orange-500/5' : 
              'bg-gray-800/50 text-white border border-gray-700 hover:border-gray-500'
          }
        `}
        style={primary && !prefersReducedMotion ? { 
          backgroundSize: '200% 100%',
          backgroundPosition: isHovered ? '100% 0' : '0% 0' 
        } : {}}
      >
        <span>{children}</span>
        <motion.span 
          className="inline-flex items-center justify-center"
          animate={prefersReducedMotion ? {} : { 
            x: isHovered ? 5 : 0,
            scale: isHovered ? 1.1 : 1,
            transition: {
              type: "spring",
              stiffness: 500,
              damping: 15
            }
          }}
        >
          <motion.svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            animate={prefersReducedMotion ? {} : isHovered ? { x: [0, 3, 0] } : { x: [0, 2, 0] }}
            transition={{
              duration: isHovered ? 0.6 : 1.5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: isHovered ? 0 : 0.5
            }}
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </motion.svg>
        </motion.span>
      </div>
    </motion.div>
  );

  if (action) {
    return (
      <button onClick={action} className="appearance-none">
        {buttonContent}
      </button>
    );
  }
  
  return <Link to={to}>{buttonContent}</Link>;
};

export default Home;