import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch } from 'react-icons/fi';
import ProveedorListItemCard from '../components/proveedores/ProveedorListItemCard'; // <-- Usa la nueva tarjeta
import ProveedorModal from '../components/modals/ProveedorModal';
import ConfirmModal from '../components/modals/ConfirmModal';

function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { token, user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiService.getProveedores(token);
      setProveedores(res.data);
    } catch (error) {
      toast.error('No se pudieron cargar los proveedores.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleOpenAddModal = () => { setItemToEdit(null); setIsModalOpen(true); };
  const handleOpenEditModal = (prov) => { setItemToEdit(prov); setIsModalOpen(true); };
  const handleDeleteClick = (prov) => { setItemToDelete(prov); };

  const handleSubmit = (formData) => {
    const promise = itemToEdit
      ? apiService.updateProveedor(itemToEdit.id, formData, token)
      : apiService.createProveedor(formData, token);
    
    toast.promise(promise, {
      loading: 'Guardando...',
      success: () => { setIsModalOpen(false); setItemToEdit(null); loadData(); return '¡Guardado con éxito!'; },
      error: 'Error al guardar el proveedor.',
    });
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    toast.promise(apiService.deleteProveedor(itemToDelete.id, token), {
      loading: 'Eliminando...',
      success: () => { setItemToDelete(null); loadData(); return 'Proveedor eliminado con éxito.'; },
      error: (err) => err.response?.data?.message || 'Error al eliminar.',
    });
  };

  const filteredProveedores = useMemo(() =>
    proveedores.filter(p => p.nombre_proveedor.toLowerCase().includes(searchTerm.toLowerCase())),
    [proveedores, searchTerm]
  );

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Proveedores</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar proveedor..."
              className="w-full rounded-full border bg-white py-2 pl-10 pr-4 shadow-sm sm:w-72"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          {user.rol === 'Administrador' && (
            <button onClick={handleOpenAddModal} className="flex-shrink-0 flex items-center gap-2 rounded-full bg-primary text-white px-4 py-2 text-sm font-bold shadow-md">
              <FiPlus /> Añadir Proveedor
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? <p className="p-4 text-center col-span-full">Cargando proveedores...</p> : filteredProveedores.map(proveedor => (
          <ProveedorListItemCard key={proveedor.id} proveedor={proveedor} onEdit={handleOpenEditModal} onDelete={handleDeleteClick} />
        ))}
      </div>

      <ProveedorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSubmit} 
        itemToEdit={itemToEdit} 
      />
      <ConfirmModal 
        isOpen={itemToDelete !== null} 
        onClose={() => setItemToDelete(null)} 
        onConfirm={handleConfirmDelete} 
        title="Eliminar Proveedor"
      >
        <p>¿Seguro que quieres eliminar <strong>{itemToDelete?.nombre_proveedor}</strong>? Esta acción no se puede deshacer.</p>
      </ConfirmModal>
    </>
  );
}

export default ProveedoresPage;