// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { jwtDecode } from 'jwt-decode'; // 👈 Necesitaremos esta librería

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Estado para guardar el token. Lo inicializamos desde localStorage.
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Función para iniciar sesión
  const login = (newToken) => {
    localStorage.setItem('token', newToken); // Guardamos en el navegador
    setToken(newToken);
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('token'); // Lo borramos del navegador
    setToken(null);
  };

  // Función para obtener los datos del usuario decodificando el token
  const getUser = () => {
    if (!token) return null;
    try {
      return jwtDecode(token); // Decodificamos el token para obtener id, rol, etc.
    } catch (error) {
      console.error("Error decodificando el token", error);
      logout(); // Si el token es inválido, cerramos sesión
      return null;
    }
  };

  const value = {
    token,
    login,
    logout,
    user: getUser(), // Exponemos el usuario decodificado
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto más fácilmente
export const useAuth = () => {
  return useContext(AuthContext);
};