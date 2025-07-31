import axios from 'axios';

//const API_URL = 'http://localhost:4000/api';
const API_URL = '/api';


const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const getAllTrabajadores = async (token, filters = {}) => {
  const sedes = filters.ubicaciones?.filter(u => u.startsWith('sede-')).map(u => u.replace('sede-', ''));
  const centros = filters.ubicaciones?.filter(u => u.startsWith('centro-')).map(u => u.replace('centro-', ''));

  const config = {
    ...getConfig(token),
    params: {
      search: filters.search || undefined,
      sedes: sedes?.join(',') || undefined,
      centros: centros?.join(',') || undefined,
      puestos: filters.puestos?.join(',') || undefined,
      estado: filters.estado === 'Todos' ? undefined : filters.estado,
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
const getTerritorios = (token) => axios.get(`${API_URL}/territorios`, getConfig(token));
const getDepartamentos = (token) => axios.get(`${API_URL}/departamentos`, getConfig(token));
const getTiposCentro = (token) => axios.get(`${API_URL}/tipos-centro`, getConfig(token));

const importTrabajadores = (file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  };
  return axios.post(`${API_URL}/trabajadores/import`, formData, config);
};

const trabajadoresService = {
  getAllTrabajadores,
  createTrabajador,
  updateTrabajador,
  deleteTrabajador,
  getPuestos,
  getSedes,
  getCentros,
  getTerritorios,
  getDepartamentos,
  getTiposCentro,
  importTrabajadores,
};

export default trabajadoresService;