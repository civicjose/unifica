import express from 'express';
import { getAllTiposCentro, createTipoCentro, updateTipoCentro, deleteTipoCentro } from '../controllers/tipoCentroController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllTiposCentro);

// Rutas de gestión solo para Administradores
router.post('/', protect, authorize('Administrador'), createTipoCentro);
router.put('/:id', protect, authorize('Administrador'), updateTipoCentro);
router.delete('/:id', protect, authorize('Administrador'), deleteTipoCentro);

export default router;