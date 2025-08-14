import express from 'express';
import { 
  getAllSedes, 
  getSedeById,
  createSede, 
  updateSede, 
  deleteSede 
} from '../controllers/sedesController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getSedeDetails } from '../controllers/sedesController.js';

const router = express.Router();

// Rutas de lectura para usuarios logueados
router.get('/', protect, getAllSedes);
router.get('/:id', protect, getSedeById); // Para obtener datos para el modal de edición
router.get('/:id/details', protect, getSedeDetails);

// Rutas de escritura y borrado solo para Administradores
router.post('/', protect, authorize('Administrador'), createSede);
router.put('/:id', protect, authorize('Administrador'), updateSede);
router.delete('/:id', protect, authorize('Administrador'), deleteSede);

export default router;