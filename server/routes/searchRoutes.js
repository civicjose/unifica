import express from 'express';
import { globalSearch } from '../controllers/searchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/global', protect, globalSearch);

export default router;