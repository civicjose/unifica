// server/routes/authRoutes.js
import express from 'express';
const router = express.Router();
import { registerUser, loginUser } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// Rutas públicas
router.post('/login', loginUser);

// Ruta para crear usuarios, solo para Administradores
router.post('/register', protect, authorize('Administrador'), registerUser);

// Ruta para obtener datos del propio usuario (cualquier rol logueado)
router.get('/me', protect, (req, res) => {
    res.status(200).json({
        id: req.user.id,
        rol: req.user.rol
    });
});

// 👇 La corrección
export default router;