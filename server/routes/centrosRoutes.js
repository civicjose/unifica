import express from 'express';
import { getAllCentros, getCentroDetails, createCentro, updateCentro, deleteCentro } from '../controllers/centrosController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas de lectura para usuarios logueados
router.get('/', protect, getAllCentros);
router.get('/:id/details', protect, getCentroDetails);

// Rutas de escritura y borrado solo para Administradores
router.post('/', protect, authorize('Administrador'), createCentro);
router.put('/:id', protect, authorize('Administrador'), updateCentro);
router.delete('/:id', protect, authorize('Administrador'), deleteCentro);

export default router;