import express from 'express';
import { 
  getAllProveedores, 
  createProveedor, 
  updateProveedor, 
  deleteProveedor,
  getContactsByProvider, 
  createContact, 
  updateContact, 
  deleteContact,
  getProveedorById,
  getVinculosByProvider
} from '../controllers/proveedoresController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Rutas Principales de Proveedores ---
router.route('/')
  .all(protect, authorize('Administrador'))
  .get(getAllProveedores)
  .post(createProveedor);

router.route('/:id')
  .all(protect, authorize('Administrador'))
  .get(getProveedorById)
  .put(updateProveedor)
  .delete(deleteProveedor);
  
// --- Rutas para los Contactos de un Proveedor ---
router.route('/:proveedorId/contactos')
  .all(protect, authorize('Administrador'))
  .get(getContactsByProvider)
  .post(createContact);

// --- Rutas para gestionar un Contacto específico por su ID ---
router.route('/contactos/:id')
  .all(protect, authorize('Administrador'))
  .put(updateContact)
  .delete(deleteContact);

// --- Ruta para obtener los vínculos de un proveedor ---
router.get('/:id/vinculos', protect, authorize('Administrador'), getVinculosByProvider);

export default router;