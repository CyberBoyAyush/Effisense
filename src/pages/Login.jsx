import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Simulated login function
  const handleLogin = (e) => {
    e.preventDefault();

    // Get users from local storage
    const users = JSON.parse(localStorage.getItem("users")) || [];
    
    // Check if user exists
    const user = users.find((user) => user.email === email && user.password === password);
    
    if (user) {
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      navigate("/dashboard"); // Redirect to Dashboard on success
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] bg-gradient-to-br from-black via-gray-900 to-[#0F0F0F] py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Background Effects with overflow control */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px] 
          -top-20 -left-20 animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[120px] 
          -bottom-20 -right-20 animate-pulse delay-1000"></div>
      </div>

      <motion.div 
        className="max-w-md w-full space-y-8 bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-orange-700/30
        shadow-lg z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center">
          <motion.h2 
            className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Welcome Back
          </motion.h2>
          <motion.p 
            className="mt-2 text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Log in to your Effisense account
          </motion.p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div 
            className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-center break-words"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        {/* Form - Improved container constraints */}
        <motion.form 
          onSubmit={handleLogin} 
          className="mt-8 space-y-6 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="space-y-4 w-full">
            <div>
              <label htmlFor="email" className="text-gray-300 text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="appearance-none relative block w-full mt-1 px-4 py-3 bg-gray-900/50 
                  border border-gray-700 placeholder-gray-500 text-gray-200 rounded-lg focus:outline-none 
                  focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="text-gray-300 text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="appearance-none relative block w-full mt-1 px-4 py-3 bg-gray-900/50 
                  border border-gray-700 placeholder-gray-500 text-gray-200 rounded-lg focus:outline-none 
                  focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <motion.button
            type="submit"
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg
              hover:from-orange-500 hover:to-amber-500 transform hover:scale-[1.02] transition-all duration-200 
              shadow-[0_0_15px_rgba(251,146,60,0.5)] hover:shadow-[0_0_20px_rgba(251,146,60,0.6)]
              font-medium text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign in
          </motion.button>
        </motion.form>

        <motion.p 
          className="text-center text-gray-400 break-words"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          Don't have an account?{' '}
          <Link to="/signup" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
            Sign up
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;