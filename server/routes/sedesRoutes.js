import express from 'express';
import { getAllSedes } from '../controllers/sedesController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/', protect, getAllSedes);
export default router;