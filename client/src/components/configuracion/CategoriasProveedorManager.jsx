import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';
import { FiPlus, FiEdit2, FiTrash2, FiList } from 'react-icons/fi';
import CategoriaModal from '../modals/CategoriaModal'; // Lo crearemos a continuación
import ConfirmModal from '../modals/ConfirmModal';

function CategoriasProveedorManager() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiService.getCategoriasProveedor(token);
      setCategorias(res.data);
    } catch (error) {
      toast.error('No se pudieron cargar las categorías.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleOpenAddModal = () => { setItemToEdit(null); setIsModalOpen(true); };
  const handleOpenEditModal = (cat) => { setItemToEdit(cat); setIsModalOpen(true); };
  
  const handleSubmit = (formData) => {
    const promise = itemToEdit
      ? apiService.updateCategoriaProveedor(itemToEdit.id, formData, token)
      : apiService.createCategoriaProveedor(formData, token);

    toast.promise(promise, {
      loading: 'Guardando...',
      success: () => { setIsModalOpen(false); loadData(); return '¡Categoría guardada!'; },
      error: 'Error al guardar.',
    });
  };
  
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    toast.promise(apiService.deleteCategoriaProveedor(itemToDelete.id, token), {
      loading: 'Eliminando...',
      success: () => { setItemToDelete(null); loadData(); return 'Categoría eliminada.'; },
      error: (err) => err.response?.data?.message || 'Error al eliminar.',
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-700">Categorías de Proveedor</h2>
        <button onClick={handleOpenAddModal} className="flex items-center gap-2 rounded-full bg-primary text-white px-4 py-2 text-sm font-bold shadow-md">
          <FiPlus /> Nueva Categoría
        </button>
      </div>
      <p className="text-slate-500 mb-4">Define las categorías de servicios (Comunicaciones, CCTV, etc.) y los campos personalizados que se solicitarán para cada una en las fichas de Centros y Sedes.</p>

      <div className="bg-white rounded-xl border shadow-sm">
        <ul className="divide-y divide-slate-200">
          {loading ? <li className="p-4 text-center">Cargando...</li> : categorias.map(cat => (
            <li key={cat.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-secondary">{cat.nombre_categoria}</p>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                  <FiList />
                  <span>{cat.campos_formulario.length} campos personalizados</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenEditModal(cat)} className="p-2 text-blue-600"><FiEdit2 /></button>
                <button onClick={() => setItemToDelete(cat)} className="p-2 text-red-600"><FiTrash2 /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <CategoriaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} itemToEdit={itemToEdit} />
      <ConfirmModal isOpen={itemToDelete !== null} onClose={() => setItemToDelete(null)} onConfirm={handleConfirmDelete} title="Eliminar Categoría">
        <p>¿Seguro que quieres eliminar la categoría <strong>{itemToDelete?.nombre_categoria}</strong>?</p>
      </ConfirmModal>
    </>
  );
}

export default CategoriasProveedorManager;