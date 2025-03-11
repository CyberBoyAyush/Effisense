import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <div className="relative mt-16 min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] 
          -top-20 -left-20 animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] 
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
                className="aspect-square border border-gray-500/20 rounded-lg backdrop-blur-sm"
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
            {/* AI Badge */}
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r 
                from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-400 
                text-sm gap-2 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="font-medium">AI-Powered Productivity</span>
            </motion.div>

            {/* Fixed Heading */}
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
                from-blue-400 via-purple-400 to-blue-400">
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

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4 mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/signup"
                  className="group px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl 
                    hover:bg-blue-700 transition-all duration-200 
                    shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)]
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
                    border border-gray-700/50 flex items-center justify-center gap-2"
                >
                  Learn More
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
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
          />
          <AIFeatureCard
            icon="⚡"
            title="Intelligent Scheduling"
            description="Let AI find the perfect time slots for your tasks based on your productivity patterns."
            delay={0.2}
          />
          <AIFeatureCard
            icon="📊"
            title="Predictive Analytics"
            description="Get insights about your productivity trends with AI-powered analytics."
            delay={0.4}
          />
        </div>
      </motion.div>
    </div>
  );
};

const AIFeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    className="group p-6 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 
      hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    whileHover={{ y: -5 }}
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"
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

export default Home;