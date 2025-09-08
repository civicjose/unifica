import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';
import { FiPlus, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';
import AplicacionModal from '../modals/AplicacionModal';
import AsignarContactosModal from '../modals/AsignarContactosModal';
import ConfirmModal from '../modals/ConfirmModal';

function ProveedorAplicaciones({ proveedor, contactos }) {
  const [aplicaciones, setAplicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();

  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [appToAssignContacts, setAppToAssignContacts] = useState(null);
  
  const loadAplicaciones = useCallback(async () => {
    if (!token || !proveedor.id) return;
    setLoading(true);
    try {
      const res = await apiService.getAplicacionesByProveedor(proveedor.id, token);
      setAplicaciones(res.data);
    } catch (error) {
      toast.error('No se pudieron cargar las aplicaciones.');
    } finally {
      setLoading(false);
    }
  }, [proveedor.id, token]);

  useEffect(() => { loadAplicaciones(); }, [loadAplicaciones]);

  const handleOpenAddModal = () => { setItemToEdit(null); setIsAppModalOpen(true); };
  const handleEditClick = (app) => { setItemToEdit(app); setIsAppModalOpen(true); };
  const handleDeleteClick = (app) => { setItemToDelete(app); };
  const handleContactsClick = (app) => { setAppToAssignContacts(app); setIsContactsModalOpen(true); };
  
  const handleSubmitApp = (formData) => {
    const dataToSend = { ...formData, proveedor_id: proveedor.id };
    const promise = itemToEdit
      ? apiService.updateAplicacion(itemToEdit.id, dataToSend, token)
      : apiService.createAplicacion(dataToSend, token);
    toast.promise(promise, {
      loading: 'Guardando...',
      success: () => { setIsAppModalOpen(false); loadAplicaciones(); return '¡Aplicación guardada!'; },
      error: 'No se pudo guardar la aplicación.',
    });
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    toast.promise(apiService.deleteAplicacion(itemToDelete.id, token), {
      loading: 'Eliminando...',
      success: () => { setItemToDelete(null); loadAplicaciones(); return 'Aplicación eliminada.'; },
      error: (err) => err.response?.data?.message || 'Error al eliminar.',
    });
  };

  return (
    <>
      {['Administrador', 'Técnico'].includes(user.rol) && (
        <div className="flex justify-end mb-4">
          <button onClick={handleOpenAddModal} className="flex items-center gap-2 rounded-full bg-primary text-white px-4 py-2 text-sm font-bold shadow-md">
            <FiPlus /> Añadir Aplicación
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Aplicación y Contactos Responsables</th>
              {user.rol !== 'Usuario' && (
                <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">Acciones</th>
              )}            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {loading ? (
              <tr><td colSpan="2" className="p-4 text-center">Cargando...</td></tr>
            ) : (
              aplicaciones.map(app => (
                <tr key={app.id}>
                  <td className="px-4 py-3 align-top">
                    <p className="font-semibold text-secondary text-base">{app.nombre_aplicacion}</p>
                    <div className="mt-2 space-y-1">
                      {app.contactos_asignados && app.contactos_asignados.length > 0 ? (
                        app.contactos_asignados.map(contacto => (
                          <div key={contacto.id} className="text-sm text-slate-600 pl-4 border-l-2">
                            <p className="font-medium">{contacto.nombre}</p>
                            <p className="text-xs text-slate-500">{contacto.email || '-'}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400 italic pl-4">Sin contactos asignados</p>
                      )}
                    </div>
                  </td>
                  {user.rol !== 'Usuario' && (
                    <td className="px-4 py-3 text-right align-top">
                      {['Administrador', 'Técnico'].includes(user.rol) && (
                        <>
                          <button onClick={() => handleContactsClick(app)} className="text-green-600 p-2" title="Asignar Contactos"><FiUsers /></button>
                          <button onClick={() => handleEditClick(app)} className="text-blue-600 p-2" title="Editar Aplicación"><FiEdit2 /></button>
                        </>
                      )}
                      {user.rol === 'Administrador' && (
                        <button onClick={() => handleDeleteClick(app)} className="text-red-600 p-2" title="Eliminar Aplicación"><FiTrash2 /></button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <AplicacionModal isOpen={isAppModalOpen} onClose={() => setIsAppModalOpen(false)} onSubmit={handleSubmitApp} itemToEdit={itemToEdit} />
      <AsignarContactosModal isOpen={isContactsModalOpen} onClose={() => setIsContactsModalOpen(false)} onSuccess={() => { setIsContactsModalOpen(false); loadAplicaciones(); }} aplicacion={appToAssignContacts} contactosProveedor={contactos} />
      <ConfirmModal isOpen={itemToDelete !== null} onClose={() => setItemToDelete(null)} onConfirm={handleConfirmDelete} title="Eliminar Aplicación">
        <p>¿Seguro que quieres eliminar <strong>{itemToDelete?.nombre_aplicacion}</strong>?</p>
      </ConfirmModal>
    </>
  );
}

export default ProveedorAplicaciones;