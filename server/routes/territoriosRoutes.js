import express from 'express';
import { getAllTerritorios, createTerritorio, updateTerritorio, deleteTerritorio } from '../controllers/territoriosController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// La ruta GET sigue siendo accesible para usuarios logueados (para los filtros)
router.get('/', protect, getAllTerritorios);

// Las rutas de gestión solo para Administradores
router.post('/', protect, authorize('Administrador'), createTerritorio);
router.put('/:id', protect, authorize('Administrador'), updateTerritorio);
router.delete('/:id', protect, authorize('Administrador'), deleteTerritorio);

export default router;