// server/routes/userRoutes.js

import express from 'express';
const router = express.Router();
import { getUsers, deleteUser, updateUser } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// GET /api/users - Obtener todos los usuarios
router.get('/', protect, authorize('Administrador'), getUsers);
router.delete('/:id', protect, authorize('Administrador'), deleteUser);
router.put('/:id', protect, authorize('Administrador'), updateUser);


export default router;