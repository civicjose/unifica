import express from 'express';
import { addProveedorToSede, updateProveedorInSede, deleteProveedorFromSede } from '../controllers/sedeProveedorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('Administrador'));

router.route('/').post(addProveedorToSede);
router.route('/:id').put(updateProveedorInSede).delete(deleteProveedorFromSede);

export default router;