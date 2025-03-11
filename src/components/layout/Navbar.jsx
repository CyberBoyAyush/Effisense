import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-blue-600">Effisense</Link>

      {!isDashboard ? (
        // Navbar for Landing Page
        <div>
          <Link to="/login" className="px-4 py-2 text-gray-700 hover:text-blue-600">Login</Link>
          <Link to="/signup" className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Sign Up</Link>
        </div>
      ) : (
        // Navbar for Dashboard
        <div className="flex items-center">
          <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;