import express from 'express';
import { getAllPuestos, createPuesto, updatePuesto, deletePuesto } from '../controllers/puestosController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta pública para obtener la lista (usada en filtros)
router.get('/', protect, getAllPuestos);

// Rutas de gestión solo para Administradores
router.post('/', protect, authorize('Administrador'), createPuesto);
router.put('/:id', protect, authorize('Administrador'), updatePuesto);
router.delete('/:id', protect, authorize('Administrador'), deletePuesto);

export default router;