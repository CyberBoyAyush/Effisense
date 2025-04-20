import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// This component wraps routes that require authentication
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem('loggedInUser');
    
    if (!loggedInUser) {
      // Redirect to login if no user found
      navigate('/login');
    }
  }, [navigate]);

  // Render children only if authenticated
  return (
    <>
      {localStorage.getItem('loggedInUser') && children}
    </>
  );
};

export default ProtectedRoute;
