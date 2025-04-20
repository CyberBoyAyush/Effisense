import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaLock, FaRegEye, FaRegEyeSlash, FaGoogle, FaUser, FaCheckCircle } from "react-icons/fa";
import { FiX, FiAlertTriangle } from "react-icons/fi";
import { FaCalendarAlt } from "react-icons/fa";
import { createAccount } from '../utils/appwrite';

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [verificationSent, setVerificationSent] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      navigate("/dashboard");
    }
  }, [navigate]);

  // Password strength validation
  const validatePassword = (value) => {
    const strength = {
      hasSixChars: value.length >= 6,
      hasLowerCase: /[a-z]/.test(value),
      hasUpperCase: /[A-Z]/.test(value),
      hasNumber: /\d/.test(value),
    };
    return strength;
  };

  // Get current password strength
  const passwordStrength = validatePassword(password);
  const passwordStrengthScore = Object.values(passwordStrength).filter(Boolean).length;
  
  // Generate password strength text
  const getPasswordStrengthText = () => {
    if (password.length === 0) return "";
    if (passwordStrengthScore < 2) return "Weak";
    if (passwordStrengthScore < 4) return "Medium";
    return "Strong";
  };

  // Generate password strength color
  const getPasswordStrengthColor = () => {
    if (password.length === 0) return "";
    if (passwordStrengthScore < 2) return "red";
    if (passwordStrengthScore < 4) return "yellow";
    return "green";
  };

  // Check if passwords match
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  // Handle next step
  const handleNext = (e) => {
    e.preventDefault();
    
    // Basic validation for first step
    if (!name || !email) {
      setError("Please fill all required fields");
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setStep(2);
  };

  // Updated signup function
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (passwordStrengthScore < 3) {
      setError("Please use a stronger password");
      return;
    }
    
    setIsLoading(true);

    try {
      await createAccount(email, password, name);
      setSuccess("Account created successfully! Please check your email to verify your account.");
      setVerificationSent(true);
    } catch (err) {
      if (err.code === 409) {
        setError("Email already exists. Please log in.");
      } else {
        setError(err.message || "Failed to create account.");
      }
      setIsLoading(false);
    }
  };

  // If verification is sent, show verification prompt
  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] bg-gradient-to-br from-black via-gray-900 to-[#0F0F0F] py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-orange-700/30 shadow-xl"
          >
            <div className="text-center">
              <FaEnvelope className="w-16 h-16 mx-auto mb-4 text-orange-500" />
              <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-gray-300 mb-6">
                We've sent a verification link to {email}.<br />
                Please click the link to verify your account.
              </p>
              <p className="text-sm text-gray-400">
                Don't see the email? Check your spam folder.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Disable Google signup and show coming soon message 
  const handleGoogleSignup = () => {
    setError("Google OAuth signup coming soon!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] bg-gradient-to-br from-black via-gray-900 to-[#0F0F0F] py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px] 
          -top-20 -left-20 animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[120px] 
          -bottom-20 -right-20 animate-pulse delay-1000"></div>
      </div>

      <div className="w-full flex flex-col md:flex-row max-w-5xl relative z-10">
        {/* Left side with branding and illustration - Hidden on mobile */}
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
              Join <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">Effisense</span> today
            </motion.h2>
            <motion.p 
              className="text-gray-400 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Create an account to start organizing your tasks intelligently with AI-powered tools
            </motion.p>

            {/* Features with icons */}
            <motion.div 
              className="text-left space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {[
                { icon: "🔒", text: "Secure & private task management" },
                { icon: "☁️", text: "Cloud sync across all your devices" },
                { icon: "🎯", text: "Set & achieve your goals efficiently" },
                { icon: "🎁", text: "Free to use core features" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-lg"
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
        
        {/* Right side with signup form */}
        <motion.div 
          className="w-full md:w-1/2 bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl md:rounded-l-none md:rounded-r-2xl border border-orange-700/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Form Header */}
          <div className="text-center mb-6">
            {/* Mobile Logo */}
            <motion.div 
              className="md:hidden mx-auto mb-6 h-16 w-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <FaCalendarAlt className="text-white text-3xl" />
            </motion.div>

            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              Create your account
            </h2>
            <p className="mt-2 text-gray-400">
              Join Effisense to boost your productivity
            </p>

            {/* Step indicator */}
            {!success && (
              <div className="flex justify-center gap-2 mt-4">
                <div className={`h-2 w-8 rounded-full ${step === 1 ? 'bg-orange-500' : 'bg-gray-700'}`}></div>
                <div className={`h-2 w-8 rounded-full ${step === 2 ? 'bg-orange-500' : 'bg-gray-700'}`}></div>
              </div>
            )}
          </div>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div 
                className="relative mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-red-500/20 p-1">
                    <FiAlertTriangle className="text-red-400 w-4 h-4" />
                  </div>
                  <p>{error}</p>
                </div>
                <button 
                  onClick={() => setError("")}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-300"
                >
                  <FiX />
                </button>
              </motion.div>
            )}
            
            {success && (
              <motion.div 
                className="mb-6 bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-400" />
                  <span>{success}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Signup Button */}
          {!success && (
            <motion.button
              onClick={handleGoogleSignup}
              disabled={true}
              className="w-full flex items-center justify-center gap-3 mb-6 px-6 py-3 bg-gray-700/50 border border-gray-600 text-gray-400 rounded-xl transition-all duration-200 cursor-not-allowed"
            >
              <FaGoogle className="text-gray-400" />
              <span>Google OAuth Coming Soon</span>
            </motion.button>
          )}
          
          {/* Divider */}
          {!success && (
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-gray-700 w-full"></div>
              <span className="bg-gray-800 text-gray-400 text-xs px-3 absolute">or with email</span>
            </div>
          )}

          {/* Multi-step Form */}
          {!success && (
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form 
                  key="step1"
                  onSubmit={handleNext}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {/* Name Field */}
                  <div className="space-y-1">
                    <label htmlFor="name" className="text-sm text-gray-300 flex items-center gap-2">
                      <FaUser className="text-orange-400 text-xs" /> Full Name
                    </label>
                    <div className="relative">
                      <input
                        id="name"
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-gray-900/60 border border-gray-700/80 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 rounded-lg text-gray-200 transition-all duration-200"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1">
                    <label htmlFor="email" className="text-sm text-gray-300 flex items-center gap-2">
                      <FaEnvelope className="text-orange-400 text-xs" /> Email
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        required
                        className="w-full px-4 py-3 bg-gray-900/60 border border-gray-700/80 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 rounded-lg text-gray-200 transition-all duration-200"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 flex items-center justify-center gap-2"
                    whileHover={{ translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue to Password
                  </motion.button>

                  <p className="text-center text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
                      Sign in
                    </Link>
                  </p>
                </motion.form>
              ) : (
                <motion.form 
                  key="step2"
                  onSubmit={handleSignup}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {/* Password Field */}
                  <div className="space-y-1">
                    <label htmlFor="password" className="text-sm text-gray-300 flex items-center gap-2">
                      <FaLock className="text-orange-400 text-xs" /> Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full px-4 py-3 bg-gray-900/60 border border-gray-700/80 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 rounded-lg text-gray-200 transition-all duration-200"
                        placeholder="Create password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-orange-400"
                      >
                        {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="h-1 flex-grow rounded-full bg-gray-700 flex overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                getPasswordStrengthColor() === 'red' ? 'bg-red-500' : 
                                getPasswordStrengthColor() === 'yellow' ? 'bg-yellow-500' : 
                                'bg-green-500'
                              }`}
                              style={{ width: `${(passwordStrengthScore / 4) * 100}%` }}
                            ></div>
                          </div>
                          <span className={`ml-2 text-xs ${
                            getPasswordStrengthColor() === 'red' ? 'text-red-400' : 
                            getPasswordStrengthColor() === 'yellow' ? 'text-yellow-400' : 
                            'text-green-400'
                          }`}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div className={`flex items-center gap-1 ${passwordStrength.hasSixChars ? 'text-green-400' : 'text-gray-500'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${passwordStrength.hasSixChars ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                            <span>At least 6 characters</span>
                          </div>
                          <div className={`flex items-center gap-1 ${passwordStrength.hasUpperCase ? 'text-green-400' : 'text-gray-500'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${passwordStrength.hasUpperCase ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                            <span>Uppercase letter</span>
                          </div>
                          <div className={`flex items-center gap-1 ${passwordStrength.hasLowerCase ? 'text-green-400' : 'text-gray-500'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${passwordStrength.hasLowerCase ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                            <span>Lowercase letter</span>
                          </div>
                          <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-green-400' : 'text-gray-500'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${passwordStrength.hasNumber ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                            <span>Number</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-1">
                    <label htmlFor="confirmPassword" className="text-sm text-gray-300 flex items-center gap-2">
                      <FaLock className="text-orange-400 text-xs" /> Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        className={`w-full px-4 py-3 bg-gray-900/60 border focus:ring-1 focus:ring-orange-500/20 rounded-lg text-gray-200 transition-all duration-200 ${
                          confirmPassword ? (passwordsMatch ? 'border-green-500/50' : 'border-red-500/50') : 'border-gray-700/80'
                        }`}
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-orange-400"
                      >
                        {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                      </button>
                    </div>
                    {confirmPassword && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${passwordsMatch ? 'bg-green-400' : 'bg-red-500'}`}></div>
                        <span className={`text-xs ${passwordsMatch ? 'text-green-400' : 'text-red-500'}`}>
                          {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row justify-between gap-3">
                    <motion.button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-all duration-200 flex-1 text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Back
                    </motion.button>
                    
                    <motion.button
                      type="submit"
                      disabled={isLoading || !passwordsMatch || passwordStrengthScore < 3}
                      className={`px-6 py-3 rounded-xl font-medium shadow-lg shadow-orange-500/20 flex-1 text-sm flex items-center justify-center gap-2 ${
                        isLoading || !passwordsMatch || passwordStrengthScore < 3
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:shadow-orange-500/40'
                      }`}
                      whileHover={isLoading || !passwordsMatch || passwordStrengthScore < 3 ? {} : { translateY: -2 }}
                      whileTap={isLoading || !passwordsMatch || passwordStrengthScore < 3 ? {} : { scale: 0.98 }}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : "Create Account"}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;