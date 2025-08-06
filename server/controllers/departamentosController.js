import { getAll, create, update, remove } from './genericController.js';

// Usamos la fábrica para la tabla 'departamentos'
export const getAllDepartamentos = getAll('departamentos', 'nombre', 'nombre');
export const createDepartamento = create('departamentos', 'nombre');
export const updateDepartamento = update('departamentos', 'nombre');
export const deleteDepartamento = remove('departamentos');