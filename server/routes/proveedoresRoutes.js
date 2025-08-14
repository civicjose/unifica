import express from 'express';
import { getAllProveedores, createProveedor, updateProveedor, deleteProveedor } from '../controllers/proveedoresController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas estas rutas requieren estar logueado y ser Administrador
router.use(protect, authorize('Administrador'));

router.route('/')
  .get(getAllProveedores)
  .post(createProveedor);

router.route('/:id')
  .put(updateProveedor)
  .delete(deleteProveedor);

export default router;