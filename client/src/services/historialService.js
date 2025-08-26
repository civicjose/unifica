import axios from 'axios';

const API_URL = 'http://localhost:4000/api/historial';
//const API_URL = '/api/historial';

const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

/**
 * Obtiene el historial de modificaciones para una entidad específica.
 * @param {string} entidad - El nombre de la tabla (ej: 'trabajadores').
 * @param {number} id - El ID del registro.
 * @param {string} token - El token JWT.
 * @returns {Promise<Array>}
 */
const getHistorial = async (entidad, id, token) => {
  const response = await axios.get(`${API_URL}/${entidad}/${id}`, getConfig(token));
  return response.data;
};

const historialService = {
  getHistorial,
};

export default historialService;