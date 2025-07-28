import express from 'express';
import { getAllCentros } from '../controllers/centrosController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/', protect, getAllCentros);
export default router;