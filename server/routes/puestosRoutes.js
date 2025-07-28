import express from 'express';
import { getAllPuestos } from '../controllers/puestosController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/', protect, getAllPuestos);
export default router;