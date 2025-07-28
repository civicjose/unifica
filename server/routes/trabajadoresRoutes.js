// server/routes/trabajadoresRoutes.js
import express from 'express';
import {
  getAllTrabajadores,
  createTrabajador,
  updateTrabajador,
  deleteTrabajador
} from '../controllers/trabajadoresController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas de trabajadores estarán protegidas, requieren login
router.use(protect);

router.route('/')
  .get(getAllTrabajadores)
  .post(createTrabajador);

router.route('/:id')
  .put(updateTrabajador)
  .delete(deleteTrabajador);

export default router;