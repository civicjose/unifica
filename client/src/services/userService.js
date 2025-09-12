import axios from 'axios';

const AUTH_API_URL = 'http://localhost:4000/api/auth';
const USERS_API_URL = 'http://localhost:4000/api/users';
//const AUTH_API_URL = '/api/auth';
//const USERS_API_URL = '/api/users';

/**
 * Llama al endpoint para registrar un nuevo usuario.
 * @param {object} userData - { nombre_completo, email, password, rol_id }
 * @param {string} token - El token JWT del usuario autenticado.
 * @returns {Promise<object>}
 */
const createUser = async (userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(`${AUTH_API_URL}/register`, userData, config);
  return response.data;
};

/**
 * Obtiene la lista de todos los usuarios de la aplicación.
 * @param {string} token - El token JWT para la autorización.
 * @returns {Promise<Array>}
 */
const getUsers = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(USERS_API_URL, config);
  return response.data;
};

/**
 * Elimina un usuario por su ID.
 * @param {number} id - El ID del usuario a eliminar.
 * @param {string} token - El token JWT para la autorización.
 * @returns {Promise<object>}
 */
const deleteUser = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.delete(`${USERS_API_URL}/${id}`, config);
  return response.data;
};

const updateUser = async (id, userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(`${USERS_API_URL}/${id}`, userData, config);
  return response.data;
};

// 👇 Añade la nueva función a la exportación
const userService = {
  createUser,
  getUsers,
  deleteUser,
  updateUser,
};

export default userService;