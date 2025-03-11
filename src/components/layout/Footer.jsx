import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white text-center p-4">
      <p>&copy; {new Date().getFullYear()} Effisense. All rights reserved.</p>
    </footer>
  );
};

export default Footer;