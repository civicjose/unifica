import axios from 'axios';

const API_URL = 'http://localhost:4000/api/glpi';

const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

/**
 * Busca un ordenador en GLPI asociado a un email.
 * @param {string} email - El email del trabajador.
 * @param {string} token - El token JWT de autenticación.
 * @returns {Promise<object>}
 */
const getComputerByEmail = async (email, token) => {
  const config = {
    ...getConfig(token),
    params: { email }
  };
  const response = await axios.get(`${API_URL}/computer`, config);
  return response.data;
};

const glpiService = {
  getComputerByEmail,
};

export default glpiService;