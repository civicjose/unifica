import express from 'express';
import { 
  getAllCentros, 
  getCentroDetails, 
  createCentro, 
  updateCentro, 
  deleteCentro, 
  getDirectoresByCentro, 
  getTrabajadoresByCentro
} from '../controllers/centrosController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllCentros);
router.get('/:id/details', protect, getCentroDetails);
router.get('/:id/directores', protect, getDirectoresByCentro);
router.get ('/:id/trabajadores', protect, getTrabajadoresByCentro);

// Rutas de escritura y borrado
router.post('/', protect, authorize('Administrador', 'Técnico'), createCentro);
router.put('/:id', protect, authorize('Administrador', 'Técnico'), updateCentro);
router.delete('/:id', protect, authorize('Administrador'), deleteCentro);

export default router;