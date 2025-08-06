import axios from 'axios';

const API_URL = 'http://localhost:4000/api';
//const API_URL = '/api';

const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// --- Trabajadores ---
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
      territorios: filters.territorios?.join(',') || undefined,
      estado: filters.estado === 'Todos' ? undefined : filters.estado,
    }
  };
  const response = await axios.get(`${API_URL}/trabajadores`, config);
  return response.data;
};

const createTrabajador = (data, token) => axios.post(`${API_URL}/trabajadores`, data, getConfig(token));
const updateTrabajador = (id, data, token) => axios.put(`${API_URL}/trabajadores/${id}`, data, getConfig(token));
const deleteTrabajador = (id, token) => axios.delete(`${API_URL}/trabajadores/${id}`, getConfig(token));

const importTrabajadores = (file, token) => {
  const formData = new FormData();
  formData.append('file', file);
  const config = {
    headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
  };
  return axios.post(`${API_URL}/trabajadores/import`, formData, config);
};


// --- Funciones para obtener listas ---
const getPuestos = (token) => axios.get(`${API_URL}/puestos`, getConfig(token));
const getSedes = (token) => axios.get(`${API_URL}/sedes`, getConfig(token));
const getCentros = (token) => axios.get(`${API_URL}/centros`, getConfig(token));
const getTerritorios = (token) => axios.get(`${API_URL}/territorios`, getConfig(token));
const getDepartamentos = (token) => axios.get(`${API_URL}/departamentos`, getConfig(token));
const getTiposCentro = (token) => axios.get(`${API_URL}/tipos-centro`, getConfig(token));

// --- Funciones CRUD para Entidades ---

// Puestos
const createPuesto = (data, token) => axios.post(`${API_URL}/puestos`, data, getConfig(token));
const updatePuesto = (id, data, token) => axios.put(`${API_URL}/puestos/${id}`, data, getConfig(token));
const deletePuesto = (id, token) => axios.delete(`${API_URL}/puestos/${id}`, getConfig(token));

// Departamentos
const createDepartamento = (data, token) => axios.post(`${API_URL}/departamentos`, data, getConfig(token));
const updateDepartamento = (id, data, token) => axios.put(`${API_URL}/departamentos/${id}`, data, getConfig(token));
const deleteDepartamento = (id, token) => axios.delete(`${API_URL}/departamentos/${id}`, getConfig(token));

// Territorios
const createTerritorio = (data, token) => axios.post(`${API_URL}/territorios`, data, getConfig(token));
const updateTerritorio = (id, data, token) => axios.put(`${API_URL}/territorios/${id}`, data, getConfig(token));
const deleteTerritorio = (id, token) => axios.delete(`${API_URL}/territorios/${id}`, getConfig(token));


const trabajadoresService = {
  // Trabajadores
  getAllTrabajadores,
  createTrabajador,
  updateTrabajador,
  deleteTrabajador,
  importTrabajadores,
  // Obtener Listas
  getPuestos,
  getSedes,
  getCentros,
  getTerritorios,
  getDepartamentos,
  getTiposCentro,
  // CRUD Puestos
  createPuesto,
  updatePuesto,
  deletePuesto,
  // CRUD Departamentos
  createDepartamento,
  updateDepartamento,
  deleteDepartamento,
  // CRUD Territorios
  createTerritorio,
  updateTerritorio,
  deleteTerritorio,
};

export default trabajadoresService;