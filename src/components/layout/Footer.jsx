import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Brand & Copyright */}
          <div className="flex items-center gap-2">
            <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Effisense
            </span>
            <span className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()}
            </span>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link to="/" className="text-gray-400 hover:text-blue-400 transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-gray-400 hover:text-blue-400 transition-colors">
              About
            </Link>
            <a 
              href="mailto:support@effisense.com" 
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;