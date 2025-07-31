import express from 'express';
import { getAllDepartamentos } from '../controllers/departamentosController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/', protect, getAllDepartamentos);
export default router;