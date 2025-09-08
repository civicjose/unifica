import express from 'express';
import { 
  getAllAplicaciones, createAplicacion, updateAplicacion, 
  deleteAplicacion, getAplicacionContactos, setAplicacionContactos 
} from '../controllers/aplicacionesController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getAllAplicaciones)
  .post(protect, authorize('Administrador', 'Técnico'), createAplicacion);

router.route('/:id')
  .put(protect, authorize('Administrador', 'Técnico'), updateAplicacion)
  .delete(protect, authorize('Administrador'), deleteAplicacion);

router.route('/:id/contactos')
  .get(protect, getAplicacionContactos)
  .put(protect, authorize('Administrador', 'Técnico'), setAplicacionContactos);

export default router;