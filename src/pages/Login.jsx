import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaLock, FaRegEye, FaRegEyeSlash, FaGoogle, FaCheckCircle } from "react-icons/fa";
import { FiX, FiAlertTriangle } from "react-icons/fi";
import { FaCalendarAlt } from "react-icons/fa";
import { login, resetPassword, createGoogleOAuthSession } from '../utils/appwrite';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Check for success message from reset password page
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Updated login function with Appwrite
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const user = await login(email, password);
      if (user) {
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login with OAuth
  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    
    try {
      // Start Google OAuth process - this will redirect to Google
      await createGoogleOAuthSession('dashboard');
    } catch (err) {
      setError("Failed to initialize Google login. Please try again.");
      setGoogleLoading(false);
    }
  };

  // Updated password reset with Appwrite
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
      setTimeout(() => {
        setShowResetForm(false);
        setResetSuccess(false);
        setResetEmail("");
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] bg-gradient-to-br from-black via-gray-900 to-[#0F0F0F] py-8 px-3 sm:py-12 sm:px-4 lg:px-8">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px] 
          -top-20 -left-20 animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[120px] 
          -bottom-20 -right-20 animate-pulse delay-1000"></div>
      </div>

      <div className="w-full flex flex-col md:flex-row max-w-5xl relative z-10">
        {/* Left side with branding and illustration */}
        <motion.div 
          className="hidden md:flex md:w-1/2 bg-gradient-to-br from-gray-800/80 via-gray-900 to-orange-950/30 rounded-l-2xl p-8 items-center justify-center"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="text-center max-w-md mx-auto">
            {/* Logo */}
            <motion.div 
              className="flex justify-center mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="h-20 w-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <FaCalendarAlt className="text-white text-4xl" />
              </div>
            </motion.div>

            <motion.h2 
              className="text-3xl font-bold text-white mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Welcome back to <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">Effisense</span>
            </motion.h2>
            <motion.p 
              className="text-gray-400 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Your AI-powered productivity companion for smarter task management and efficient scheduling
            </motion.p>

            {/* Features Grid */}
            <motion.div 
              className="grid grid-cols-2 gap-4 text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {[
                { icon: "🤖", text: "AI Task Prioritization" },
                { icon: "⚡", text: "Smart Scheduling" },
                { icon: "🔄", text: "Recurring Tasks" },
                { icon: "📊", text: "Productivity Analytics" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + (i * 0.1) }}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-gray-300 text-sm">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
        
        {/* Right side with login form */}
        <motion.div 
          className="w-full md:w-1/2 bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-l-none md:rounded-r-2xl border border-orange-700/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Form Header */}
          <div className="text-center mb-6 sm:mb-8">
            {/* Mobile Logo */}
            <motion.div 
              className="md:hidden mx-auto mb-4 sm:mb-6 h-14 w-14 sm:h-16 sm:w-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <FaCalendarAlt className="text-white text-2xl sm:text-3xl" />
            </motion.div>
            
            <AnimatePresence mode="wait">
              {showResetForm ? (
                <motion.h2 
                  key="reset-title"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent"
                >
                  Reset Password
                </motion.h2>
              ) : (
                <motion.h2 
                  key="login-title"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent"
                >
                  Sign in to your account
                </motion.h2>
              )}
            </AnimatePresence>
            <p className="mt-1 sm:mt-2 text-sm text-gray-400">
              {showResetForm ? "We'll send you a reset link" : "Access your tasks and calendar"}
            </p>
          </div>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div 
                className="relative mb-4 sm:mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-red-500/20 p-1">
                    <FiAlertTriangle className="text-red-400 w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <p className="text-xs sm:text-sm">{error}</p>
                </div>
                <button 
                  onClick={() => setError("")}
                  className="absolute top-2 sm:top-3 right-2 sm:right-3 text-red-400 hover:text-red-300"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </motion.div>
            )}
            
            {successMessage && (
              <motion.div 
                className="mb-4 sm:mb-6 bg-green-500/10 border border-green-500/50 text-green-400 px-3 sm:px-4 py-2 sm:py-3 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-400" />
                  <p className="text-xs sm:text-sm">{successMessage}</p>
                </div>
              </motion.div>
            )}
            
            {resetSuccess && (
              <motion.div 
                className="mb-4 sm:mb-6 bg-green-500/10 border border-green-500/50 text-green-400 px-3 sm:px-4 py-2 sm:py-3 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-green-500/20 p-1">
                    <FiX className="text-green-400 w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <p className="text-xs sm:text-sm">Password reset link sent! Check your email.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!showResetForm ? (
              /* Login Form */
              <motion.div
                key="login-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Google Login Button */}
                <motion.button
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 mb-4 sm:mb-6 px-4 py-2.5 sm:py-3 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 rounded-xl transition-all duration-200 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {googleLoading ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-orange-600/30 border-t-orange-600 rounded-full animate-spin" />
                  ) : (
                    <>
                      <FaGoogle className="text-blue-600 text-sm sm:text-base" />
                      <span>Sign in with Google</span>
                    </>
                  )}
                </motion.button>
                
                {/* Divider */}
                <div className="relative flex items-center justify-center mb-4 sm:mb-6">
                  <div className="border-t border-gray-700 w-full"></div>
                  <span className="bg-gray-800 text-gray-400 text-[10px] sm:text-xs px-2 sm:px-3 absolute">or sign in with email</span>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                  {/* Email Field */}
                  <div className="space-y-1">
                    <label htmlFor="email" className="text-xs sm:text-sm text-gray-300 flex items-center gap-2">
                      <FaEnvelope className="text-orange-400 text-[10px] sm:text-xs" /> Email
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        required
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900/60 border border-gray-700/80 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 rounded-lg text-gray-200 transition-all duration-200 text-sm"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password Field with Show/Hide toggle */}
                  <div className="space-y-1">
                    <label htmlFor="password" className="text-xs sm:text-sm text-gray-300 flex items-center gap-2">
                      <FaLock className="text-orange-400 text-[10px] sm:text-xs" /> Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900/60 border border-gray-700/80 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 rounded-lg text-gray-200 transition-all duration-200 text-sm"
                        placeholder="••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-orange-400 touch-manipulation"
                      >
                        {showPassword ? <FaRegEyeSlash className="text-lg" /> : <FaRegEye className="text-lg" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me and Forgot Password */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                    <label className="flex items-center text-xs sm:text-sm touch-manipulation">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="rounded border-gray-700 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 h-4 w-4"
                      />
                      <span className="ml-2 text-gray-400">Remember me</span>
                    </label>
                    <button 
                      type="button"
                      onClick={() => setShowResetForm(true)}
                      className="text-xs sm:text-sm text-orange-400 hover:text-orange-300 transition-colors px-1 py-1"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 sm:px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 flex items-center justify-center gap-2 mt-6"
                    whileHover={{ translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : "Sign in"}
                  </motion.button>
                </form>

                {/* Sign Up Link */}
                <p className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-gray-400">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-orange-400 hover:text-orange-300 font-medium transition-colors px-1 py-2 inline-block">
                    Create one now
                  </Link>
                </p>
              </motion.div>
            ) : (
              /* Password Reset Form */
              <motion.form 
                key="reset-form" 
                onSubmit={handleResetPassword}
                className="space-y-4 sm:space-y-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-1">
                  <label htmlFor="reset-email" className="text-xs sm:text-sm text-gray-300 flex items-center gap-2">
                    <FaEnvelope className="text-orange-400 text-[10px] sm:text-xs" /> Email Address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900/60 border border-gray-700/80 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 rounded-lg text-gray-200 transition-all duration-200 text-sm"
                    placeholder="your@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 sm:px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 flex items-center justify-center gap-2 mt-6"
                  whileHover={{ translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Send Reset Link"}
                </motion.button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setShowResetForm(false)}
                    className="text-xs sm:text-sm text-orange-400 hover:text-orange-300 transition-colors px-2 py-2 inline-block"
                  >
                    Back to Login
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;