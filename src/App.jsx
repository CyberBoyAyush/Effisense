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
      {/* Navbar - Highest z-index */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Sidebar - Below navbar */}
      <div className="fixed top-16 left-0 bottom-0 z-40 w-64">
        <Sidebar hidelogo={true} />
      </div>

      {/* Main Content - Adjusted margins */}
      <div className="flex-1 ml-64 mt-16">
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="fixed bottom-0 right-0 left-64 z-20">
          <Footer />
        </footer>
      </div>
    </div>
  );
};

export default App;