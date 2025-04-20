import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ToastProvider } from './contexts/ToastContext';

const App = () => {
  const location = useLocation();
  const isPublicPage = ['/', '/login', '/signup', '/reset-password', '/verify-email', '/privacy', '/about-us'].includes(location.pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isPublicPage) {
    return (
      <ToastProvider>
        <div className="flex flex-col min-h-screen bg-gray-900">
          <Navbar />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </ToastProvider>
    );
  }

  // For protected routes, wrap content with ProtectedRoute component
  return (
    <ToastProvider>
      <ProtectedRoute>
        <div className="flex min-h-screen bg-gray-900 overflow-x-hidden">
          {/* Navbar */}
          <div className="fixed top-0 left-0 right-0 z-50">
            <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} showMenuButton={!isPublicPage} />
          </div>

          {/* Mobile Sidebar Backdrop */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Responsive Sidebar */}
          <div 
            className={`fixed md:fixed top-16 left-0 bottom-0 z-40 w-64 transform transition-all duration-300 ease-in-out
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
          >
            <Sidebar onClose={() => setIsSidebarOpen(false)} />
          </div>

          {/* Main Content Area with Footer */}
          <div className="flex-1 w-full min-h-screen md:ml-64">
            <div className="flex flex-col min-h-screen">
              <main className="pt-16 px-2 sm:px-4 md:px-8 pb-20 w-full">
                <div className="max-w-7xl mx-auto">
                  <Outlet />
                </div>
              </main>

              {/* Footer - Fixed at bottom */}
              <div className="mt-auto">
                <Footer />
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </ToastProvider>
  );
};

export default App;