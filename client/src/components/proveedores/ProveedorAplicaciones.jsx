import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';
import { FiPlus } from 'react-icons/fi';
import AplicacionModal from '../modals/AplicacionModal';
import AsignarContactosModal from '../modals/AsignarContactosModal';
import ConfirmModal from '../modals/ConfirmModal';
import AplicacionCard from './AplicacionCard';

function ProveedorAplicaciones({ proveedor, contactos }) {
  const { token, user } = useAuth();
  const [aplicaciones, setAplicaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [appToEdit, setAppToEdit] = useState(null);
  const [appToDelete, setAppToDelete] = useState(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [appToAssign, setAppToAssign] = useState(null);

  const loadAplicaciones = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getAplicacionesByProveedor(proveedor.id, token);
      const appsData = res.data;

      const appsConContactos = await Promise.all(
        appsData.map(async (app) => {
          const contactosRes = await apiService.getAplicacionContactos(app.id, token);
          return { ...app, contactosAsignados: contactosRes.data };
        })
      );
      
      setAplicaciones(appsConContactos);
    } catch (error) {
      toast.error('No se pudieron cargar las aplicaciones.');
    } finally {
      setLoading(false);
    }
  }, [proveedor.id, token]);

  useEffect(() => {
    loadAplicaciones();
  }, [loadAplicaciones]);

  const handleOpenAddModal = () => {
    setAppToEdit(null);
    setIsAppModalOpen(true);
  };
  const handleOpenEditModal = (app) => {
    setAppToEdit(app);
    setIsAppModalOpen(true);
  };
  const handleOpenAssignModal = (app) => {
    setAppToAssign(app);
    setIsAssignModalOpen(true);
  };

  const handleAppSubmit = (formData) => {
    const dataToSend = { ...formData, proveedor_id: proveedor.id };
    const promise = appToEdit
      ? apiService.updateAplicacion(appToEdit.id, dataToSend, token)
      : apiService.createAplicacion(dataToSend, token);
    
    toast.promise(promise, {
      loading: 'Guardando...',
      success: () => {
        setIsAppModalOpen(false);
        loadAplicaciones();
        return '¡Aplicación guardada!';
      },
      error: 'Error al guardar la aplicación.',
    });
  };

  const handleConfirmDelete = () => {
    if (!appToDelete) return;
    toast.promise(apiService.deleteAplicacion(appToDelete.id, token), {
      loading: 'Eliminando...',
      success: () => {
        setAppToDelete(null);
        loadAplicaciones();
        return 'Aplicación eliminada.';
      },
      error: 'Error al eliminar.',
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
      
      {loading ? (
        <p className="text-center text-slate-500 p-8">Cargando aplicaciones...</p>
      ) : aplicaciones.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {aplicaciones.map(app => (
            <AplicacionCard 
              key={app.id}
              aplicacion={app}
              onEdit={handleOpenEditModal}
              onDelete={() => setAppToDelete(app)}
              onAssignContacts={handleOpenAssignModal}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500 p-8">No hay aplicaciones registradas para este proveedor.</p>
      )}

      <AplicacionModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        onSubmit={handleAppSubmit}
        itemToEdit={appToEdit}
      />
      <AsignarContactosModal
        isOpen={isAssignModalOpen}
        onClose={() => { setIsAssignModalOpen(false); loadAplicaciones(); }}
        aplicacion={appToAssign}
        contactosProveedor={contactos}
      />
      <ConfirmModal
        isOpen={appToDelete !== null}
        onClose={() => setAppToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Aplicación"
      >
        <p>¿Seguro que quieres eliminar la aplicación <strong>{appToDelete?.nombre_aplicacion}</strong>?</p>
      </ConfirmModal>
    </>
  );
}

export default ProveedorAplicaciones;