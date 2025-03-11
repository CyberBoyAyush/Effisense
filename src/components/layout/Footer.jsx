import React from "react";
import { FaGithub, FaEnvelope, FaBug, FaHeart } from "react-icons/fa";

const Footer = () => {
  const email = "cseayushsharma@gmail.com";
  
  const openReportBugEmail = () => {
    const subject = encodeURIComponent("Bug/Feedback Report for Effisense");
    const body = encodeURIComponent("Describe the issue or feedback here:\n\n");
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <footer className="bg-gradient-to-r from-gray-900/95 via-gray-900/90 to-orange-950/20 backdrop-blur-md border-t border-orange-800/30">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between sm:space-y-0 space-y-3">
          {/* Left Side - Brand and Made with love */}
          <div className="flex flex-col items-center sm:items-start space-y-1">
            <div className="flex items-center gap-1.5 group">
              <span className="text-base font-bold text-orange-400 group-hover:text-orange-300 transition-colors duration-300">
                Effisense
              </span>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <span>Made with</span>
              <FaHeart className="w-3 h-3 text-rose-500 animate-pulse" />
              <span>&copy; {new Date().getFullYear()}</span>
            </div>
          </div>
          
          {/* Right Side - Actions and Links */}
          <div className="flex items-center gap-4">
            <button
              onClick={openReportBugEmail}
              className="px-3 py-1.5 bg-gray-800/70 hover:bg-gray-700/70 border border-orange-500/30 
                rounded-lg text-gray-300 hover:text-orange-300 transition-all duration-200 
                flex items-center gap-1.5 text-xs"
            >
              <FaBug className="text-orange-400" />
              <span>Report Bug</span>
            </button>
            
            <a 
              href="https://github.com/effisense" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-orange-300 transition-colors rounded-full hover:bg-gray-800/50"
              aria-label="GitHub"
            >
              <FaGithub className="w-4 h-4" />
            </a>
            <a 
              href={`mailto:${email}`} 
              className="p-2 text-gray-400 hover:text-orange-300 transition-colors rounded-full hover:bg-gray-800/50"
              aria-label="Email"
            >
              <FaEnvelope className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;