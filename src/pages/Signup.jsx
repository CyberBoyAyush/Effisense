import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Simulated signup function
  const handleSignup = (e) => {
    e.preventDefault();

    // Get existing users
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if email is already registered
    if (users.find((user) => user.email === email)) {
      setError("Email already exists. Please login.");
      return;
    }

    // Create new user
    const newUser = { name, email, password };
    users.push(newUser);

    // Save user to local storage
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("loggedInUser", JSON.stringify(newUser));

    navigate("/dashboard"); // Redirect to Dashboard after signup
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="mt-2 text-gray-400">Join Effisense and boost your productivity</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignup} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="text-gray-300 text-sm font-medium">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                className="appearance-none relative block w-full mt-1 px-4 py-3 bg-gray-900/50 
                  border border-gray-700 placeholder-gray-500 text-gray-200 rounded-lg focus:outline-none 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="text-gray-300 text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="appearance-none relative block w-full mt-1 px-4 py-3 bg-gray-900/50 
                  border border-gray-700 placeholder-gray-500 text-gray-200 rounded-lg focus:outline-none 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="text-gray-300 text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="appearance-none relative block w-full mt-1 px-4 py-3 bg-gray-900/50 
                  border border-gray-700 placeholder-gray-500 text-gray-200 rounded-lg focus:outline-none 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
              transform hover:scale-[1.02] transition-all duration-200 
              shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]
              font-medium text-sm"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;