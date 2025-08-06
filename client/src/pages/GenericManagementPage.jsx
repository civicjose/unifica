import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import ConfirmModal from '../components/modals/ConfirmModal';

// fields: [{ name: 'nombre', label: 'Nombre' }]
// o para territorios: [{ name: 'codigo', label: 'Código' }, { name: 'zona', label: 'Zona' }]
function GenericManagementPage({ title, fields, fetchAll, createItem, updateItem, deleteItem }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [itemData, setItemData] = useState({});
  const [itemToDelete, setItemToDelete] = useState(null);

  const { token } = useAuth();

  const loadItems = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetchAll(token);
      setItems(response.data);
    } catch (error) {
      toast.error(`Error al cargar ${title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [token, fetchAll, title]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleOpenModal = (item = null) => {
    setCurrentItem(item);
    // Inicializa el estado del formulario
    if (item) {
      setItemData(item);
    } else {
      const initialData = {};
      fields.forEach(field => initialData[field.name] = '');
      setItemData(initialData);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setItemData({});
  };

  const handleInputChange = (e) => {
    setItemData({ ...itemData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const actionPromise = currentItem
      ? updateItem(currentItem.id, itemData, token)
      : createItem(itemData, token);

    toast.promise(actionPromise, {
      loading: 'Guardando...',
      success: () => {
        loadItems();
        handleCloseModal();
        return `¡${currentItem ? 'Actualizado' : 'Creado'} con éxito!`;
      },
      error: (err) => err.response?.data?.message || 'Error al guardar.',
    });
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    toast.promise(deleteItem(itemToDelete.id, token), {
      loading: 'Eliminando...',
      success: () => {
        setItemToDelete(null);
        loadItems();
        return 'Eliminado con éxito.';
      },
      error: (err) => err.response?.data?.message || 'Error al eliminar.',
    });
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex transform items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-purple-600 px-5 py-2.5 font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          <FiPlus /> Añadir Nuevo
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
        {loading ? <p className="p-4 text-center">Cargando...</p> : (
          <ul className="divide-y divide-slate-200">
            {items.map(item => (
              <li key={item.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                {/* Muestra el primer campo o una combinación */}
                <span className="text-slate-800">
                  {item.codigo ? `${item.codigo} - ${item.zona}` : item.nombre}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(item)} className="text-blue-500 hover:text-blue-700"><FiEdit2 /></button>
                  <button onClick={() => setItemToDelete(item)} className="text-red-500 hover:text-red-700"><FiTrash2 /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal Genérico */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-2xl font-semibold text-secondary">{currentItem ? 'Editar' : 'Añadir'} {title.slice(0, -1)}</h3>
              <button onClick={handleCloseModal} className="text-3xl font-light text-gray-400 hover:text-gray-800">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {fields.map(field => (
                <div key={field.name}>
                  <label className="mb-1 block text-sm font-medium text-slate-600">{field.label}</label>
                  <input
                    type="text"
                    name={field.name}
                    value={itemData[field.name] || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                    required
                  />
                </div>
              ))}
              <div className="flex justify-end gap-4 border-t border-slate-200 pt-4 mt-6">
                <button type="button" onClick={handleCloseModal} className="rounded-full bg-slate-100 px-5 py-2 font-bold text-slate-700 transition-colors hover:bg-slate-200">Cancelar</button>
                <button type="submit" className="rounded-full bg-primary px-5 py-2 font-bold text-white transition-colors hover:bg-primary/80">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={`Eliminar ${title.slice(0,-1)}`}
      >
        <p>¿Estás seguro de que deseas eliminar <strong>{itemToDelete?.nombre || itemToDelete?.codigo}</strong>? Esta acción no se puede deshacer.</p>
      </ConfirmModal>
    </>
  );
}

export default GenericManagementPage;