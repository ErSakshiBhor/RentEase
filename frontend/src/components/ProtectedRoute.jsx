import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // User is not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // User does not have permission for this route
  if (allowedRole && role !== allowedRole) {
    if (role === "owner") {
      return <Navigate to="/dashboard" replace />;
    }

    if (role === "tenant") {
      return <Navigate to="/tenant-dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;