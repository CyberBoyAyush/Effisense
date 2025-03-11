import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <>
      {/* Hero Section with Dark Theme */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-gradient"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center relative z-10">
            <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight mb-6">
              Welcome to Effisense
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              AI-powered productivity hub for smart task management and scheduling
            </p>
            <div className="mt-10 flex justify-center gap-6">
              <Link to="/signup" 
                className="group px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl 
                  hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 
                  shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)]">
                Get Started
                <span className="inline-block ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link to="/login" 
                className="px-8 py-4 bg-gray-800/50 text-white font-semibold rounded-xl 
                  backdrop-blur-sm hover:bg-gray-800/70 transform hover:scale-105 
                  transition-all duration-200 border border-gray-700">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 -mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon="🎯"
            title="Task Management"
            description="Organize and prioritize your tasks effectively"
          />
          <FeatureCard 
            icon="📅"
            title="Smart Scheduling"
            description="AI-powered calendar management"
          />
          <FeatureCard 
            icon="📊"
            title="Analytics"
            description="Track your productivity and progress"
          />
        </div>
      </div>
    </>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 
    hover:border-blue-500/50 transition-all duration-300 
    hover:shadow-[0_0_25px_rgba(59,130,246,0.1)] group">
    <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

export default Home;