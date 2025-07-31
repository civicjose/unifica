import express from 'express';
import { getAllTiposCentro } from '../controllers/tipoCentroController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/', protect, getAllTiposCentro);
export default router;