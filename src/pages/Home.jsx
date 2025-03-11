import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
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
                <Link to="/signup"
                  className="group px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-xl 
                    hover:from-orange-500 hover:to-amber-500 transition-all duration-200 
                    shadow-[0_0_30px_rgba(251,146,60,0.4)] hover:shadow-[0_0_40px_rgba(251,146,60,0.5)]
                    flex items-center justify-center gap-2"
                >
                  Get Started Free
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

      {/* Features Grid - Updated with orange theme */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AIFeatureCard
            icon="🧠"
            title="Smart Prioritization"
            description="AI analyzes your tasks and suggests the optimal order based on deadlines and importance."
            delay={0}
            color="orange"
          />
          <AIFeatureCard
            icon="⚡"
            title="Intelligent Scheduling"
            description="Let AI find the perfect time slots for your tasks based on your productivity patterns."
            delay={0.2}
            color="amber"
          />
          <AIFeatureCard
            icon="📊"
            title="Predictive Analytics"
            description="Get insights about your productivity trends with AI-powered analytics."
            delay={0.4}
            color="orange"
          />
        </div>
      </motion.div>
    </div>
  );
};

// Updated AIFeatureCard with orange theme
const AIFeatureCard = ({ icon, title, description, delay, color = "orange" }) => {
  const gradientClass = 
    color === "amber" 
      ? "from-amber-500/10 to-orange-500/10 hover:border-amber-500/50" 
      : "from-orange-500/10 to-amber-500/10 hover:border-orange-500/50";

  return (
    <motion.div
      className={`group p-6 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 
        transition-all duration-300 relative overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${gradientClass}`}
        initial={{ x: "-100%" }}
        whileHover={{ x: 0 }}
        transition={{ duration: 0.5 }}
      />
      <div className="relative">
        <motion.div
          className="text-4xl mb-4"
          whileHover={{ scale: 1.2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {icon}
        </motion.div>
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </motion.div>
  );
};

export default Home;