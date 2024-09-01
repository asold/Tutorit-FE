import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  if (!token || !userId) {
    // If token or userId is missing, redirect to login page
    return <Navigate to="/login" />;
  }

  // If both token and userId are present, render the children components
  return children;
};

export default PrivateRoute;
