import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Effisense
            </h3>
            <p className="text-gray-400">Making productivity effortless with AI-powered solutions.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Features</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center space-x-2">
                <span className="text-blue-400">→</span>
                <span>Task Management</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-400">→</span>
                <span>Smart Scheduling</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-400">→</span>
                <span>Analytics</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center space-x-2">
                <span className="text-blue-400">📧</span>
                <span>support@effisense.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-400">📱</span>
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Effisense. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;