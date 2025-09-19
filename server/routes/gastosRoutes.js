import express from 'express';
import multer from 'multer';
import { getGastos, createGasto, deleteGasto, updateGasto, exportGastos } from '../controllers/gastosController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

router.get('/export', exportGastos);
router.get('/', getGastos);

router.post('/', authorize('Administrador', 'Técnico'), upload.single('factura'), createGasto);

router.put('/:id', authorize('Administrador', 'Técnico'), upload.single('factura'), updateGasto);
router.delete('/:id', authorize('Administrador'), deleteGasto);

export default router;