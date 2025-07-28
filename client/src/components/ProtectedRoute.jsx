// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // Si no hay usuario, redirige a la página de login
    return <Navigate to="/" />;
  }

  // Si hay usuario, muestra el componente hijo (la página que se quiere proteger)
  return children;
}

export default ProtectedRoute;