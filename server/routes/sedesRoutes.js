import express from 'express';
import { 
  getAllSedes, 
  getSedeById,
  createSede, 
  updateSede, 
  deleteSede,
  getSedeDetails
} from '../controllers/sedesController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllSedes);
router.get('/:id', protect, getSedeById);
router.get('/:id/details', protect, getSedeDetails);

// Rutas de escritura y borrado
router.post('/', protect, authorize('Administrador', 'Técnico'), createSede); 
router.put('/:id', protect, authorize('Administrador', 'Técnico'), updateSede); 
router.delete('/:id', protect, authorize('Administrador'), deleteSede); 

export default router;