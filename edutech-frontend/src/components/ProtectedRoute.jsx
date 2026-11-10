import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/Appcontext";

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { userData, isAuthLoading } = useContext(AppContext);

  // Show loading while auth is being checked
  if (isAuthLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff', background: '#1A1A1A' }}>Loading...</div>;
  }

  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userData.role !== requiredRole) {
    // Redirect to appropriate dashboard based on their role
    if (userData.role === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (userData.role === "tutor") {
      return <Navigate to="/tutor-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
