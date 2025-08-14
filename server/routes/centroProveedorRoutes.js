import express from 'express';
import { addProveedorToCentro, updateProveedorInCentro, deleteProveedorFromCentro } from '../controllers/centroProveedorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('Administrador'));

router.route('/')
  .post(addProveedorToCentro);

router.route('/:id')
  .put(updateProveedorInCentro)
  .delete(deleteProveedorFromCentro);

export default router;