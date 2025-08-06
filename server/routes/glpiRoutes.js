// server/routes/glpiRoutes.js
import express from 'express';
import { getComputerByEmail } from '../controllers/glpiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta protegida para obtener el ordenador por email
router.get('/computer', protect, getComputerByEmail);

export default router;