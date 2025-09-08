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

router.route('/')
  .get(protect, getAllProveedores)
  .post(protect, authorize('Administrador', 'Técnico'), createProveedor);

router.route('/:id')
  .get(protect, getProveedorById)
  .put(protect, authorize('Administrador', 'Técnico'), updateProveedor)
  .delete(protect, authorize('Administrador'), deleteProveedor);
  
router.route('/:proveedorId/contactos')
  .get(protect, getContactsByProvider)
  .post(protect, authorize('Administrador', 'Técnico'), createContact);

router.route('/contactos/:id')
  .put(protect, authorize('Administrador', 'Técnico'), updateContact)
  .delete(protect, authorize('Administrador'), deleteContact);

router.get('/:id/vinculos', protect, getVinculosByProvider);

export default router;