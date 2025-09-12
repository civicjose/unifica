import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:4000/api';
//const API_URL = '/api';

let isHandlingSessionExpiration = false;

export const setupAxiosInterceptors = (logout) => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401 && !isHandlingSessionExpiration) {
        isHandlingSessionExpiration = true;
        toast.error('Tu sesión ha caducado. Por favor, inicia sesión de nuevo.');
        logout(); 
      }
      return Promise.reject(error);
    }
  );
};


const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// --- Auth & Users ---
const createUser = (userData, token) => axios.post(`${API_URL}/auth/register`, userData, getConfig(token));
const getUsers = (token) => axios.get(`${API_URL}/users`, getConfig(token));
const updateUser = (id, userData, token) => axios.put(`${API_URL}/users/${id}`, userData, getConfig(token));
const deleteUser = (id, token) => axios.delete(`${API_URL}/users/${id}`, getConfig(token));

// --- Trabajadores ---
const getAllTrabajadores = (token, filters = {}) => {
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
  return axios.get(`${API_URL}/trabajadores`, config);
};
const createTrabajador = (data, token) => axios.post(`${API_URL}/trabajadores`, data, getConfig(token));
const updateTrabajador = (id, data, token) => axios.put(`${API_URL}/trabajadores/${id}`, data, getConfig(token));
const deleteTrabajador = (id, token) => axios.delete(`${API_URL}/trabajadores/${id}`, getConfig(token));
const importTrabajadores = (file, token) => {
  const formData = new FormData();
  formData.append('file', file);
  const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
  return axios.post(`${API_URL}/trabajadores/import`, formData, config);
};
const getTrabajadoresBySede = (id, token) => axios.get(`${API_URL}/sedes/${id}/trabajadores`, getConfig(token));
const getTrabajadoresByCentro = (id, token) => axios.get(`${API_URL}/centros/${id}/trabajadores`, getConfig(token));


// --- Listas ---
const getPuestos = (token) => axios.get(`${API_URL}/puestos`, getConfig(token));
const getSedes = (token) => axios.get(`${API_URL}/sedes`, getConfig(token));
const getCentros = (token) => axios.get(`${API_URL}/centros`, getConfig(token));
const getTerritorios = (token) => axios.get(`${API_URL}/territorios`, getConfig(token));
const getDepartamentos = (token) => axios.get(`${API_URL}/departamentos`, getConfig(token));
const getTiposCentro = (token) => axios.get(`${API_URL}/tipos-centro`, getConfig(token));

// --- CRUDs de Configuración ---
const createPuesto = (data, token) => axios.post(`${API_URL}/puestos`, data, getConfig(token));
const updatePuesto = (id, data, token) => axios.put(`${API_URL}/puestos/${id}`, data, getConfig(token));
const deletePuesto = (id, token) => axios.delete(`${API_URL}/puestos/${id}`, getConfig(token));
const createDepartamento = (data, token) => axios.post(`${API_URL}/departamentos`, data, getConfig(token));
const updateDepartamento = (id, data, token) => axios.put(`${API_URL}/departamentos/${id}`, data, getConfig(token));
const deleteDepartamento = (id, token) => axios.delete(`${API_URL}/departamentos/${id}`, getConfig(token));
const createTerritorio = (data, token) => axios.post(`${API_URL}/territorios`, data, getConfig(token));
const updateTerritorio = (id, data, token) => axios.put(`${API_URL}/territorios/${id}`, data, getConfig(token));
const deleteTerritorio = (id, token) => axios.delete(`${API_URL}/territorios/${id}`, getConfig(token));
const getCategoriasProveedor = (token) => axios.get(`${API_URL}/categorias-proveedor`, getConfig(token));
const createCategoriaProveedor = (data, token) => axios.post(`${API_URL}/categorias-proveedor`, data, getConfig(token));
const updateCategoriaProveedor = (id, data, token) => axios.put(`${API_URL}/categorias-proveedor/${id}`, data, getConfig(token));
const deleteCategoriaProveedor = (id, token) => axios.delete(`${API_URL}/categorias-proveedor/${id}`, getConfig(token));
const createTipoCentro = (data, token) => axios.post(`${API_URL}/tipos-centro`, data, getConfig(token));
const updateTipoCentro = (id, data, token) => axios.put(`${API_URL}/tipos-centro/${id}`, data, getConfig(token));
const deleteTipoCentro = (id, token) => axios.delete(`${API_URL}/tipos-centro/${id}`, getConfig(token));

// --- Proveedores ---
const getProveedores = (token) => axios.get(`${API_URL}/proveedores`, getConfig(token));
const getProveedorById = (id, token) => axios.get(`${API_URL}/proveedores/${id}`, getConfig(token));
const createProveedor = (data, token) => axios.post(`${API_URL}/proveedores`, data, getConfig(token));
const updateProveedor = (id, data, token) => axios.put(`${API_URL}/proveedores/${id}`, data, getConfig(token));
const deleteProveedor = (id, token) => axios.delete(`${API_URL}/proveedores/${id}`, getConfig(token));
const getVinculosByProvider = (id, token) => axios.get(`${API_URL}/proveedores/${id}/vinculos`, getConfig(token));

// --- Contactos de Proveedores ---
const getContactsByProvider = (proveedorId, token) => axios.get(`${API_URL}/proveedores/${proveedorId}/contactos`, getConfig(token));
const createContact = (proveedorId, data, token) => axios.post(`${API_URL}/proveedores/${proveedorId}/contactos`, data, getConfig(token));
const updateContact = (contactId, data, token) => axios.put(`${API_URL}/proveedores/contactos/${contactId}`, data, getConfig(token));
const deleteContact = (contactId, token) => axios.delete(`${API_URL}/proveedores/contactos/${contactId}`, getConfig(token));

// --- Aplicaciones ---
const getAplicaciones = (token) => axios.get(`${API_URL}/aplicaciones`, getConfig(token));
const getAplicacionesByProveedor = (proveedorId, token) => axios.get(`${API_URL}/aplicaciones`, { ...getConfig(token), params: { proveedorId } });
const createAplicacion = (data, token) => axios.post(`${API_URL}/aplicaciones`, data, getConfig(token));
const updateAplicacion = (id, data, token) => axios.put(`${API_URL}/aplicaciones/${id}`, data, getConfig(token));
const deleteAplicacion = (id, token) => axios.delete(`${API_URL}/aplicaciones/${id}`, getConfig(token));
const getAplicacionContactos = (appId, token) => axios.get(`${API_URL}/aplicaciones/${appId}/contactos`, getConfig(token));
const setAplicacionContactos = (appId, contactIds, token) => axios.put(`${API_URL}/aplicaciones/${appId}/contactos`, { contactIds }, getConfig(token));

// --- Centros ---
const getCentroDetails = (id, token) => axios.get(`${API_URL}/centros/${id}/details`, getConfig(token));
const createCentro = (data, token) => axios.post(`${API_URL}/centros`, data, getConfig(token));
const updateCentro = (id, data, token) => axios.put(`${API_URL}/centros/${id}`, data, getConfig(token));
const deleteCentro = (id, token) => axios.delete(`${API_URL}/centros/${id}`, getConfig(token));
const getDirectoresByCentro = (id, token) => axios.get(`${API_URL}/centros/${id}/directores`, getConfig(token));

// --- Sedes ---
const getSedeDetails = (id, token) => axios.get(`${API_URL}/sedes/${id}/details`, getConfig(token));
const getSedeById = (id, token) => axios.get(`${API_URL}/sedes/${id}`, getConfig(token));
const createSede = (data, token) => axios.post(`${API_URL}/sedes`, data, getConfig(token));
const updateSede = (id, data, token) => axios.put(`${API_URL}/sedes/${id}`, data, getConfig(token));
const deleteSede = (id, token) => axios.delete(`${API_URL}/sedes/${id}`, getConfig(token));

// --- Vínculos de Proveedores ---
const addProveedorToCentro = (data, token) => axios.post(`${API_URL}/centro-proveedor`, data, getConfig(token));
const updateProveedorInCentro = (id, data, token) => axios.put(`${API_URL}/centro-proveedor/${id}`, data, getConfig(token));
const deleteProveedorFromCentro = (id, token) => axios.delete(`${API_URL}/centro-proveedor/${id}`, getConfig(token));
const addProveedorToSede = (data, token) => axios.post(`${API_URL}/sede-proveedor`, data, getConfig(token));
const updateProveedorInSede = (id, data, token) => axios.put(`${API_URL}/sede-proveedor/${id}`, data, getConfig(token));
const deleteProveedorFromSede = (id, token) => axios.delete(`${API_URL}/sede-proveedor/${id}`, getConfig(token));

// --- Dashboard ---
const getDashboardStats = (token) => axios.get(`${API_URL}/dashboard/stats`, getConfig(token));

// --- Búsqueda ---
const globalSearch = (term, token) => axios.get(`${API_URL}/search/global`, { ...getConfig(token), params: { term } });

const apiService = {
  // Auth & Users
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  // Trabajadores
  getAllTrabajadores,
  createTrabajador,
  updateTrabajador,
  deleteTrabajador,
  importTrabajadores,
  getTrabajadoresBySede,
  getTrabajadoresByCentro,
  // Listas
  getPuestos,
  getSedes,
  getCentros,
  getTerritorios,
  getDepartamentos,
  getTiposCentro,
  // CRUDs Configuración
  createPuesto,
  updatePuesto,
  deletePuesto,
  createDepartamento,
  updateDepartamento,
  deleteDepartamento,
  createTerritorio,
  updateTerritorio,
  deleteTerritorio,
  getCategoriasProveedor,
  createCategoriaProveedor,
  updateCategoriaProveedor,
  deleteCategoriaProveedor,
  createTipoCentro,
  updateTipoCentro,
  deleteTipoCentro,
  // Proveedores
  getProveedores,
  getProveedorById,
  createProveedor,
  updateProveedor,
  deleteProveedor,
  getVinculosByProvider,
  // Contactos de Proveedores
  getContactsByProvider,
  createContact,
  updateContact,
  deleteContact,
  // Aplicaciones
  getAplicaciones,
  getAplicacionesByProveedor,
  createAplicacion,
  updateAplicacion,
  deleteAplicacion,
  getAplicacionContactos,
  setAplicacionContactos,
  // Centros
  getCentroDetails,
  createCentro,
  updateCentro,
  deleteCentro,
  getDirectoresByCentro,
  // Sedes
  getSedeDetails,
  getSedeById,
  createSede,
  updateSede,
  deleteSede,
  // Vínculos de Proveedores
  addProveedorToCentro,
  updateProveedorInCentro,
  deleteProveedorFromCentro,
  addProveedorToSede,
  updateProveedorInSede,
  deleteProveedorFromSede,
  // Dashboard
  getDashboardStats,
  // Búsqueda
  globalSearch,
};

export default apiService;