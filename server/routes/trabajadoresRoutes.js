import express from 'express';
import multer from 'multer';
import { 
  getAllTrabajadores, 
  createTrabajador, 
  updateTrabajador, 
  deleteTrabajador, 
  importTrabajadores
} from '../controllers/trabajadoresController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.route('/')
  .get(protect, getAllTrabajadores)
  .post(protect, authorize('Administrador', 'Técnico'), createTrabajador);

router.route('/:id')
  .put(protect, authorize('Administrador', 'Técnico'), updateTrabajador)
  .delete(protect, authorize('Administrador'), deleteTrabajador);


router.post(
  '/import', 
  protect, 
  authorize('Administrador', 'Técnico'), 
  upload.single('file'),
  importTrabajadores
);

export default router;