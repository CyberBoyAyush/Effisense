import React from "react";
import { FaHeart, FaGithub } from "react-icons/fa";
import { BiSolidBug } from "react-icons/bi";
import { IoShieldCheckmarkSharp, IoInformationCircleSharp } from "react-icons/io5";
import { HiOutlineMail } from "react-icons/hi";

const Footer = () => {
  const email = "connect@ayush-sharma.in";

  const openReportBugEmail = () => {
    const subject = encodeURIComponent("Bug/Feedback Report for Effisense");
    const body = encodeURIComponent("Describe the issue or feedback here:\n\n");
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <footer className="bg-gradient-to-r from-gray-900/95 via-gray-900/90 to-orange-950/20 backdrop-blur-md border-t border-orange-800/30">
      <div className="mx-auto px-4 py-4 md:py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between sm:space-y-0 space-y-4">
          {/* Left Side - Brand and Made with love */}
          <div className="flex flex-col items-center sm:items-start space-y-1">
            <div className="flex items-center gap-1.5 group">
              <span className="text-base font-bold text-orange-400 group-hover:text-orange-300 transition-colors duration-300">
                Effisense
              </span> 
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <span>Made by Ayush Sharma with</span>
              <FaHeart className="w-3 h-3 text-rose-500 animate-pulse" />
              <span>&copy; {new Date().getFullYear()}</span>
            </div>
          </div>

          {/* Right Side - Actions and Links */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={openReportBugEmail}
              className="px-3 py-1.5 bg-gray-800/70 hover:bg-gray-700/70 border border-orange-500/30 
                rounded-lg text-gray-300 hover:text-orange-300 transition-all duration-200 
                flex items-center gap-1.5 text-xs w-fit"
            >
              <BiSolidBug className="text-orange-400 w-4 h-4" />
              <span>Report Bug</span>
            </button>

            <div className="flex items-center gap-4">
              <a
                href="/about-us"
                className="p-2 text-amber-400 hover:text-amber-300 transition-colors rounded-full hover:bg-gray-800/50 hover:scale-110 transform duration-200"
                aria-label="About Us"
              >
                <IoInformationCircleSharp className="w-5 h-5" />
              </a>

              <a
                href="https://github.com/cyberboyayush/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-rose-400 hover:text-rose-300 transition-colors rounded-full hover:bg-gray-800/50 hover:scale-110 transform duration-200"
                aria-label="GitHub"
              >
                <FaGithub className="w-5 h-5" />
              </a>

              <a
                href={`mailto:${email}`}
                className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors rounded-full hover:bg-gray-800/50 hover:scale-110 transform duration-200"
                aria-label="Email"
              >
                <HiOutlineMail className="w-5 h-5" />
              </a>

              <a
                href="/privacy"
                className="p-2 text-orange-400 hover:text-orange-300 transition-colors rounded-full hover:bg-gray-800/50 hover:scale-110 transform duration-200"
                aria-label="Privacy Policy"
              >
                <IoShieldCheckmarkSharp className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
