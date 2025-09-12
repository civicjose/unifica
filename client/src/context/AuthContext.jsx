import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  // Función para validar el token que se puede reutilizar
  const validateToken = useCallback((currentToken) => {
    if (!currentToken) {
      setUser(null);
      return;
    }
    try {
      const decoded = jwtDecode(currentToken);
      if (decoded.exp * 1000 < Date.now()) {
        console.log("Token expirado, cerrando sesión.");
        logout();
      } else {
        setUser(decoded);
      }
    } catch (error) {
      console.error("Token inválido, cerrando sesión.", error);
      logout();
    }
  }, [logout]);

  // Se ejecuta al cargar y cada vez que cambia el token
  useEffect(() => {
    validateToken(token);
  }, [token, validateToken]);

  // Se ejecuta cuando el usuario vuelve a la pestaña del navegador
  useEffect(() => {
    const handleFocus = () => {
      console.log('Ventana enfocada, validando token...');
      const currentToken = localStorage.getItem('token');
      validateToken(currentToken);
    };

    window.addEventListener('focus', handleFocus);

    // Limpiamos el evento al desmontar el componente
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [validateToken]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const value = {
    token,
    login,
    logout,
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};