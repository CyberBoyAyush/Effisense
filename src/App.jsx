import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import Footer from "./components/layout/Footer";

const App = () => {
  const location = useLocation();
  const isPublicPage = ['/', '/login', '/signup'].includes(location.pathname);

  if (isPublicPage) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Fixed Navbar at the very top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Sidebar - Positioned below navbar */}
      <div className="fixed top-16 left-0 bottom-0 z-40 w-64">
        <Sidebar hidelogo={true} />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Main Content Area */}
        <div className="flex flex-col min-h-screen">
          <main className="flex-1 pt-16 px-8 pb-24">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>

          {/* Footer */}
          <div className="mt-auto">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;