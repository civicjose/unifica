import { getAll, create, update, remove } from './genericController.js';

// Usamos la fábrica para crear y exportar los controladores para la tabla 'puestos'
export const getAllPuestos = getAll('puestos', 'nombre_puesto', 'nombre_puesto');
export const createPuesto = create('puestos', 'nombre_puesto');
export const updatePuesto = update('puestos', 'nombre_puesto');
export const deletePuesto = remove('puestos');