import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Simulated login function
  const handleLogin = (e) => {
    e.preventDefault();

    // Get users from local storage
    const users = JSON.parse(localStorage.getItem("users")) || [];
    
    // Check if user exists
    const user = users.find((user) => user.email === email && user.password === password);
    
    if (user) {
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      navigate("/dashboard"); // Redirect to Dashboard on success
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="mt-2 text-gray-400">Log in to your Effisense account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
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
                placeholder="Enter your password"
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
            Sign in
          </button>
        </form>

        <p className="text-center text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;