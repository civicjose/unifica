import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const getAllTrabajadores = async (token, filters = {}) => {
  const config = {
    ...getConfig(token),
    params: {
      search: filters.search || undefined,
      centros: filters.centros?.join(',') || undefined,
      puestos: filters.puestos?.join(',') || undefined,
    }
  };
  const response = await axios.get(`${API_URL}/trabajadores`, config);
  return response.data;
};

// --- CRUD ---
const createTrabajador = (data, token) => axios.post(`${API_URL}/trabajadores`, data, getConfig(token));
const updateTrabajador = (id, data, token) => axios.put(`${API_URL}/trabajadores/${id}`, data, getConfig(token));
const deleteTrabajador = (id, token) => axios.delete(`${API_URL}/trabajadores/${id}`, getConfig(token));

// --- Funciones para obtener datos para los selectores ---
const getPuestos = (token) => axios.get(`${API_URL}/puestos`, getConfig(token));
const getSedes = (token) => axios.get(`${API_URL}/sedes`, getConfig(token));
const getCentros = (token) => axios.get(`${API_URL}/centros`, getConfig(token));

const trabajadoresService = {
  getAllTrabajadores,
  createTrabajador,
  updateTrabajador,
  deleteTrabajador,
  getPuestos,
  getSedes,
  getCentros,
};

export default trabajadoresService;