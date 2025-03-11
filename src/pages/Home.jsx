import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-4xl font-bold text-gray-800">Welcome to Effisense</h1>
        <p className="text-lg text-gray-600 mt-4">AI-powered productivity hub for smart task management and scheduling.</p>
        <Link to="/signup" className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition">
          Get Started
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default Home;