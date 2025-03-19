import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';

const ToastContext = createContext({});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 mt-16"> {/* Changed from bottom-4 to top-4 and added mt-16 */}
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}  /* Changed y from 20 to -20 */
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}      /* Changed y from -20 to 20 */
              className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm
                ${toast.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 
                  toast.type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                  'bg-orange-500/20 text-orange-300 border border-orange-500/30'}`}
            >
              {toast.type === 'success' ? <FaCheckCircle /> :
               toast.type === 'error' ? <FaTimesCircle /> : 
               <FaInfoCircle />}
              <p className="text-sm font-medium">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
