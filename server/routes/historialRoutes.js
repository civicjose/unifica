import express from 'express';
import { getHistorialPorEntidad } from '../controllers/historialController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta para obtener el historial de una entidad específica (ej: /api/historial/trabajadores/491)
router.get('/:entidad/:id', protect, getHistorialPorEntidad);

export default router;