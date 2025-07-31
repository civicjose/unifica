// src/services/authService.js
import axios from 'axios';

// La URL base de tu API en el backend
const API_URL = 'http://localhost:4000/api/auth';

/**
 * Llama al endpoint de login de la API.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} La respuesta de la API (incluye el token).
 */
const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });
  return response.data;
};

// Exportamos un objeto con todos los métodos del servicio
const authService = {
  login,
};

export default authService;