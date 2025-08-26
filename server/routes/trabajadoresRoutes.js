import express from 'express';
import { 
  getAllTrabajadores, 
  createTrabajador, 
  updateTrabajador, 
  deleteTrabajador, 
  importTrabajadores
} from '../controllers/trabajadoresController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getAllTrabajadores)
  .post(protect, authorize('Administrador'), createTrabajador);

router.post('/import', protect, authorize('Administrador'), importTrabajadores);

router.route('/:id')
  .put(protect, authorize('Administrador'), updateTrabajador)
  .delete(protect, authorize('Administrador'), deleteTrabajador);

export default router;