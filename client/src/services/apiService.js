import axios from 'axios';

//const API_URL = 'http://localhost:4000/api';
const API_URL = '/api';

const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// --- Trabajadores ---
const getAllTrabajadores = (token) => axios.get(`${API_URL}/trabajadores`, getConfig(token));
const createTrabajador = (data, token) => axios.post(`${API_URL}/trabajadores`, data, getConfig(token));
const updateTrabajador = (id, data, token) => axios.put(`${API_URL}/trabajadores/${id}`, data, getConfig(token));
const deleteTrabajador = (id, token) => axios.delete(`${API_URL}/trabajadores/${id}`, getConfig(token));
const importTrabajadores = (file, token) => {
  const formData = new FormData();
  formData.append('file', file);
  const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
  return axios.post(`${API_URL}/trabajadores/import`, formData, config);
};

// --- Listas para filtros y modales ---
const getPuestos = (token) => axios.get(`${API_URL}/puestos`, getConfig(token));
const getSedes = (token) => axios.get(`${API_URL}/sedes`, getConfig(token));
const getCentros = (token) => axios.get(`${API_URL}/centros`, getConfig(token));
const getTerritorios = (token) => axios.get(`${API_URL}/territorios`, getConfig(token));
const getDepartamentos = (token) => axios.get(`${API_URL}/departamentos`, getConfig(token));
const getTiposCentro = (token) => axios.get(`${API_URL}/tipos-centro`, getConfig(token)); // La función estaba aquí...

// --- CRUD Puestos ---
const createPuesto = (data, token) => axios.post(`${API_URL}/puestos`, data, getConfig(token));
const updatePuesto = (id, data, token) => axios.put(`${API_URL}/puestos/${id}`, data, getConfig(token));
const deletePuesto = (id, token) => axios.delete(`${API_URL}/puestos/${id}`, getConfig(token));

// --- CRUD Departamentos ---
const createDepartamento = (data, token) => axios.post(`${API_URL}/departamentos`, data, getConfig(token));
const updateDepartamento = (id, data, token) => axios.put(`${API_URL}/departamentos/${id}`, data, getConfig(token));
const deleteDepartamento = (id, token) => axios.delete(`${API_URL}/departamentos/${id}`, getConfig(token));

// --- CRUD Territorios ---
const createTerritorio = (data, token) => axios.post(`${API_URL}/territorios`, data, getConfig(token));
const updateTerritorio = (id, data, token) => axios.put(`${API_URL}/territorios/${id}`, data, getConfig(token));
const deleteTerritorio = (id, token) => axios.delete(`${API_URL}/territorios/${id}`, getConfig(token));

// --- CRUD Proveedores ---
const getProveedores = (token) => axios.get(`${API_URL}/proveedores`, getConfig(token));
const createProveedor = (data, token) => axios.post(`${API_URL}/proveedores`, data, getConfig(token));
const updateProveedor = (id, data, token) => axios.put(`${API_URL}/proveedores/${id}`, data, getConfig(token));
const deleteProveedor = (id, token) => axios.delete(`${API_URL}/proveedores/${id}`, getConfig(token));

// --- CRUD Aplicaciones ---
const getAplicaciones = (token) => axios.get(`${API_URL}/aplicaciones`, getConfig(token));
const createAplicacion = (data, token) => axios.post(`${API_URL}/aplicaciones`, data, getConfig(token));
const updateAplicacion = (id, data, token) => axios.put(`${API_URL}/aplicaciones/${id}`, data, getConfig(token));
const deleteAplicacion = (id, token) => axios.delete(`${API_URL}/aplicaciones/${id}`, getConfig(token));

// --- Centros ---
const getCentroDetails = (id, token) => axios.get(`${API_URL}/centros/${id}/details`, getConfig(token));
const createCentro = (data, token) => axios.post(`${API_URL}/centros`, data, getConfig(token));
const updateCentro = (id, data, token) => axios.put(`${API_URL}/centros/${id}`, data, getConfig(token));
const deleteCentro = (id, token) => axios.delete(`${API_URL}/centros/${id}`, getConfig(token));

// --- CRUD Proveedores de Centros ---
const addProveedorToCentro = (data, token) => axios.post(`${API_URL}/centro-proveedor`, data, getConfig(token));
const updateProveedorInCentro = (id, data, token) => axios.put(`${API_URL}/centro-proveedor/${id}`, data, getConfig(token));
const deleteProveedorFromCentro = (id, token) => axios.delete(`${API_URL}/centro-proveedor/${id}`, getConfig(token));

// --- CRUD Tipos de Centro ---
const createTipoCentro = (data, token) => axios.post(`${API_URL}/tipos-centro`, data, getConfig(token));
const updateTipoCentro = (id, data, token) => axios.put(`${API_URL}/tipos-centro/${id}`, data, getConfig(token));
const deleteTipoCentro = (id, token) => axios.delete(`${API_URL}/tipos-centro/${id}`, getConfig(token));

// --- Sedes ---
const getSedeById = (id, token) => axios.get(`${API_URL}/sedes/${id}`, getConfig(token));
const createSede = (data, token) => axios.post(`${API_URL}/sedes`, data, getConfig(token));
const updateSede = (id, data, token) => axios.put(`${API_URL}/sedes/${id}`, data, getConfig(token));
const deleteSede = (id, token) => axios.delete(`${API_URL}/sedes/${id}`, getConfig(token));
const getSedeDetails = (id, token) => axios.get(`${API_URL}/sedes/${id}/details`, getConfig(token));
const addProveedorToSede = (data, token) => axios.post(`${API_URL}/sede-proveedor`, data, getConfig(token));
const updateProveedorInSede = (id, data, token) => axios.put(`${API_URL}/sede-proveedor/${id}`, data, getConfig(token));
const deleteProveedorFromSede = (id, token) => axios.delete(`${API_URL}/sede-proveedor/${id}`, getConfig(token));

// --- Dashboard ---
const getDashboardStats = (token) => axios.get(`${API_URL}/dashboard/stats`, getConfig(token));

// --- Búsqueda ---
const globalSearch = (term, token) => {
  const config = {
    ...getConfig(token),
    params: { term }
  };
  return axios.get(`${API_URL}/search/global`, config);
};


const apiService = {
  // Trabajadores
  getAllTrabajadores, createTrabajador, updateTrabajador, deleteTrabajador, importTrabajadores,
  // Obtener Listas
  getPuestos, getSedes, getCentros, getTerritorios, getDepartamentos,
  getTiposCentro,
  // CRUD Puestos
  createPuesto, updatePuesto, deletePuesto,
  // CRUD Departamentos
  createDepartamento, updateDepartamento, deleteDepartamento,
  // CRUD Territorios
  createTerritorio, updateTerritorio, deleteTerritorio,
  // CRUD Proveedores
  getProveedores, createProveedor, updateProveedor, deleteProveedor,
  // CRUD Aplicaciones
  getAplicaciones, createAplicacion, updateAplicacion, deleteAplicacion,
  // CRUD Centros
  getCentroDetails, createCentro, updateCentro, deleteCentro,
  // CRUD Proveedores de Centros
  addProveedorToCentro, updateProveedorInCentro, deleteProveedorFromCentro,
  // CRUD Tipos de Centro
  createTipoCentro, updateTipoCentro, deleteTipoCentro,
  // CRUD Sedes
   getSedeById, createSede, updateSede, deleteSede,
   getSedeDetails, addProveedorToSede, updateProveedorInSede, deleteProveedorFromSede,
  // Dashboard
  getDashboardStats, globalSearch,
};

export default apiService;