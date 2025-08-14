import express from 'express';
import { getAllAplicaciones, createAplicacion, updateAplicacion, deleteAplicacion } from '../controllers/aplicacionesController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('Administrador'));

router.route('/')
  .get(getAllAplicaciones)
  .post(createAplicacion);

router.route('/:id')
  .put(updateAplicacion)
  .delete(deleteAplicacion);

export default router;