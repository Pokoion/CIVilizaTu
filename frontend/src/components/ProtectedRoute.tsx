import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const jwt = localStorage.getItem('jwt_token');
  /*
  if (!jwt) {
    return <Navigate to="/login" />;
  }
  */
  return children;
};

export default ProtectedRoute;