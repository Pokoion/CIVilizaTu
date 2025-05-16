import React from 'react';
import { Navigate } from 'react-router-dom';

interface PublicRouteProps {
  children: JSX.Element;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const jwt = localStorage.getItem('jwt_token');
  if (jwt) {
    return <Navigate to="/main-menu" replace />;
  }
  return children;
};

export default PublicRoute;