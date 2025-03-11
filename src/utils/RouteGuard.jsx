import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("loggedInUser");
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("loggedInUser");
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};
