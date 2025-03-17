import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaRegEye, FaRegEyeSlash, FaCheckCircle } from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';
import { confirmPasswordReset } from '../utils/appwrite';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get userId and secret from URL params
  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  useEffect(() => {
    if (!userId || !secret) {
      navigate('/login');
    }
  }, [userId, secret, navigate]);

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
  const passwordStrength = validatePassword(newPassword);
  const passwordStrengthScore = Object.values(passwordStrength).filter(Boolean).length;
  
  // Generate password strength text
  const getPasswordStrengthText = () => {
    if (newPassword.length === 0) return "";
    if (passwordStrengthScore < 2) return "Weak";
    if (passwordStrengthScore < 4) return "Medium";
    return "Strong";
  };

  // Generate password strength color
  const getPasswordStrengthColor = () => {
    if (newPassword.length === 0) return "";
    if (passwordStrengthScore < 2) return "red";
    if (passwordStrengthScore < 4) return "yellow";
    return "green";
  };

  // Check if passwords match
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== "";

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Only check minimal criteria client-side
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await confirmPasswordReset(userId, secret, newPassword);
      navigate('/login', { 
        state: { 
          successMessage: 'Password reset successful! Please login with your new password.' 
        } 
      });
    } catch (err) {
      console.error("Reset password error:", err);
      
      if (err.code === 401) {
        setError('Reset link has expired. Please request a new one.');
      } else if (err.code === 400) {
        setError(err.message || 'Invalid password format. Please try a different password.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to reset password. Please try again.');
      }
      
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] bg-gradient-to-br from-black via-gray-900 to-[#0F0F0F] py-12 px-4">
      <div className="w-full max-w-md">
        <motion.div
          className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-orange-700/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent mb-6">
            Reset Your Password
          </h2>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <FiAlertTriangle className="text-red-400" />
                <p>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm text-gray-300 flex items-center gap-2">
                <FaLock className="text-orange-400 text-xs" /> New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-3 bg-gray-900/60 border border-gray-700/80 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 rounded-lg text-gray-200"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-400"
                >
                  {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>
              
              {/* Password Strength Meter */}
              {newPassword && (
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

            <div className="space-y-1">
              <label className="text-sm text-gray-300 flex items-center gap-2">
                <FaLock className="text-orange-400 text-xs" /> Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className={`w-full px-4 py-3 bg-gray-900/60 border focus:ring-1 focus:ring-orange-500/20 rounded-lg text-gray-200 transition-all duration-200 ${
                    confirmPassword ? (passwordsMatch ? 'border-green-500/50' : 'border-red-500/50') : 'border-gray-700/80'
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-400"
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

            <motion.button
              type="submit"
              disabled={isLoading || !passwordsMatch || passwordStrengthScore < 3}
              className={`w-full px-6 py-3 rounded-xl font-medium shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 ${
                isLoading || !passwordsMatch || passwordStrengthScore < 3
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:shadow-orange-500/40'
              }`}
              whileHover={isLoading || !passwordsMatch || passwordStrengthScore < 3 ? {} : { translateY: -2 }}
              whileTap={isLoading || !passwordsMatch || passwordStrengthScore < 3 ? {} : { scale: 0.98 }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Reset Password"
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
