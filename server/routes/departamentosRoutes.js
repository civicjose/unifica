import express from 'express';
import { getAllDepartamentos, createDepartamento, updateDepartamento, deleteDepartamento } from '../controllers/departamentosController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllDepartamentos);
router.post('/', protect, authorize('Administrador'), createDepartamento);
router.put('/:id', protect, authorize('Administrador'), updateDepartamento);
router.delete('/:id', protect, authorize('Administrador'), deleteDepartamento);

export default router;