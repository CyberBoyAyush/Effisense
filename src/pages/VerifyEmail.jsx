import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { confirmVerification, sendVerificationEmail } from '../utils/appwrite';
import { FaCheckCircle, FaEnvelope } from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    if (userId && secret) {
      handleVerification(userId, secret);
    } else {
      setStatus('waiting');
      setMessage('Please check your email for the verification link.');
    }
  }, [searchParams]);

  const handleVerification = async (userId, secret) => {
    try {
      await confirmVerification(userId, secret);
      setStatus('success');
      setMessage('Email verified successfully!');
      // Redirect to dashboard after 2 seconds
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Verification failed. Please try again.');
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await sendVerificationEmail();
      setMessage('Verification email sent! Please check your inbox.');
      setStatus('waiting');
    } catch (error) {
      setMessage('Failed to send verification email. Please try again.');
      setStatus('error');
    }
    setIsResending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] bg-gradient-to-br from-black via-gray-900 to-[#0F0F0F] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-orange-700/30 shadow-xl"
        >
          <div className="text-center">
            {status === 'processing' && (
              <div className="w-16 h-16 mx-auto mb-4">
                <div className="w-full h-full border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            )}
            
            {status === 'success' && (
              <FaCheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            )}
            
            {status === 'error' && (
              <FiAlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            )}
            
            {status === 'waiting' && (
              <FaEnvelope className="w-16 h-16 mx-auto mb-4 text-orange-500" />
            )}

            <h2 className="text-2xl font-bold text-white mb-2">
              {status === 'processing' && 'Verifying your email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
              {status === 'waiting' && 'Check Your Email'}
            </h2>

            <p className="text-gray-300 mb-6">{message}</p>

            {(status === 'error' || status === 'waiting') && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleResendVerification}
                disabled={isResending}
                className={`w-full px-6 py-3 rounded-xl font-medium shadow-lg ${
                  isResending
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:shadow-orange-500/40'
                }`}
              >
                {isResending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  'Resend Verification Email'
                )}
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyEmail;