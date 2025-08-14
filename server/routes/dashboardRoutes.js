import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas del dashboard requieren estar logueado
router.get('/stats', protect, getDashboardStats);

export default router;