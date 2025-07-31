import express from 'express';
import multer from 'multer'; // Importamos multer
import {
  getAllTrabajadores, createTrabajador, updateTrabajador, deleteTrabajador, importTrabajadores
} from '../controllers/trabajadoresController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Configuración para recibir el archivo en memoria

router.use(protect);

router.route('/')
  .get(getAllTrabajadores)
  .post(createTrabajador);

// --- NUEVA RUTA PARA LA IMPORTACIÓN ---
router.post('/import', upload.single('file'), importTrabajadores);

router.route('/:id')
  .put(updateTrabajador)
  .delete(deleteTrabajador);

export default router;