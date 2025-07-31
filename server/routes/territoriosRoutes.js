import express from 'express';
import { getAllTerritorios } from '../controllers/territoriosController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/', protect, getAllTerritorios);
export default router;