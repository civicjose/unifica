import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import ConfirmModal from '../components/modals/ConfirmModal';

function AplicacionesPage() {
  const [aplicaciones, setAplicaciones] = useState([]);
  const [proveedores, setProveedores] = useState([]); // <-- Estado para la lista de proveedores
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [itemData, setItemData] = useState({ nombre_aplicacion: '', proveedor_id: '' });
  const [itemToDelete, setItemToDelete] = useState(null);

  const { token } = useAuth();

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [appsRes, provRes] = await Promise.all([
        apiService.getAplicaciones(token),
        apiService.getProveedores(token)
      ]);
      setAplicaciones(appsRes.data);
      setProveedores(provRes.data);
    } catch (error) {
      toast.error('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenModal = (item = null) => {
    setCurrentItem(item);
    if (item) {
      setItemData({ nombre_aplicacion: item.nombre_aplicacion, proveedor_id: item.proveedor_id || '' });
    } else {
      setItemData({ nombre_aplicacion: '', proveedor_id: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleInputChange = (e) => {
    setItemData({ ...itemData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const actionPromise = currentItem
      ? apiService.updateAplicacion(currentItem.id, itemData, token)
      : apiService.createAplicacion(itemData, token);

    toast.promise(actionPromise, {
      loading: 'Guardando...',
      success: () => { loadData(); handleCloseModal(); return '¡Guardado con éxito!'; },
      error: (err) => err.response?.data?.message || 'Error al guardar.',
    });
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    toast.promise(apiService.deleteAplicacion(itemToDelete.id, token), {
      loading: 'Eliminando...',
      success: () => { setItemToDelete(null); loadData(); return 'Eliminado con éxito.'; },
      error: (err) => err.response?.data?.message || 'Error al eliminar.',
    });
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Aplicaciones</h1>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-bold text-white shadow-md">
          <FiPlus /> Añadir Nueva
        </button>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-lg">
        {loading ? <p className="p-4 text-center">Cargando...</p> : (
          <ul className="divide-y divide-slate-200">
            {aplicaciones.map(app => (
              <li key={app.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold text-slate-800">{app.nombre_aplicacion}</p>
                  <p className="text-sm text-slate-500">{app.nombre_proveedor || 'Sin proveedor asignado'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(app)} className="text-blue-500"><FiEdit2 /></button>
                  <button onClick={() => setItemToDelete(app)} className="text-red-500"><FiTrash2 /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-2xl font-semibold text-secondary">{currentItem ? 'Editar' : 'Añadir'} Aplicación</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Nombre de la Aplicación</label>
                <input type="text" name="nombre_aplicacion" value={itemData.nombre_aplicacion} onChange={handleInputChange} className="w-full rounded-lg border-slate-300" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Proveedor</label>
                <select name="proveedor_id" value={itemData.proveedor_id} onChange={handleInputChange} className="w-full rounded-lg border-slate-300">
                  <option value="">-- Sin proveedor --</option>
                  {proveedores.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre_proveedor}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-4 pt-4 mt-4 border-t">
                <button type="button" onClick={handleCloseModal} className="rounded-full bg-slate-100 px-5 py-2 font-bold">Cancelar</button>
                <button type="submit" className="rounded-full bg-primary px-5 py-2 font-bold text-white">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <ConfirmModal isOpen={itemToDelete !== null} onClose={() => setItemToDelete(null)} onConfirm={handleConfirmDelete} title="Eliminar Aplicación">
        <p>¿Seguro que quieres eliminar <strong>{itemToDelete?.nombre_aplicacion}</strong>?</p>
      </ConfirmModal>
    </>
  );
}

export default AplicacionesPage;