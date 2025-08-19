import express from 'express';
import { 
  getAllCategorias, 
  createCategoria, 
  updateCategoria, 
  deleteCategoria 
} from '../controllers/categoriasProveedorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// El GET puede ser para todos los usuarios logueados (para rellenar modales)
router.get('/', protect, getAllCategorias);

// El resto de operaciones son solo para Administradores
router.post('/', protect, authorize('Administrador'), createCategoria);
router.put('/:id', protect, authorize('Administrador'), updateCategoria);
router.delete('/:id', protect, authorize('Administrador'), deleteCategoria);

export default router;