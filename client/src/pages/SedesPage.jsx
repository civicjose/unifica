import React, { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import SedeCard from '../components/sedes/SedeCard';
import SedeModal from '../components/modals/SedeModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import { FiSearch, FiPlus } from 'react-icons/fi';

function SedesPage() {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { token, user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [listas, setListas] = useState({ territorios: [] });
  
  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [sedesRes, territoriosRes] = await Promise.all([
        apiService.getSedes(token),
        apiService.getTerritorios(token),
      ]);
      setSedes(sedesRes.data);
      setListas({ territorios: territoriosRes.data });
    } catch (error) {
      toast.error('No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleOpenAddModal = () => { setItemToEdit(null); setIsModalOpen(true); };
  const handleOpenEditModal = (sede) => {
    apiService.getSedeById(sede.id, token).then(res => {
      setItemToEdit(res.data);
      setIsModalOpen(true);
    });
  };
  const handleDeleteClick = (sede) => { setItemToDelete(sede); };
  
  const handleModalSuccess = () => { setIsModalOpen(false); setItemToEdit(null); loadData(); };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    toast.promise(apiService.deleteSede(itemToDelete.id, token), {
      loading: 'Eliminando...',
      success: () => { setItemToDelete(null); loadData(); return 'Sede eliminada.'; },
      error: (err) => err.response?.data?.message || 'Error al eliminar.',
    });
  };

  const filteredSedes = useMemo(() => sedes.filter(s => 
    s.nombre_sede.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.localidad && s.localidad.toLowerCase().includes(searchTerm.toLowerCase()))
  ), [sedes, searchTerm]);
  
  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Sedes</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input type="text" placeholder="Buscar por nombre o localidad..." className="w-full rounded-full border bg-white py-2 pl-10 pr-4 shadow-sm sm:w-72" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          {user.rol === 'Administrador' && (
            <button onClick={handleOpenAddModal} className="flex-shrink-0 flex items-center gap-2 rounded-full bg-primary text-white px-4 py-2 text-sm font-bold shadow-md">
              <FiPlus /> Añadir Sede
            </button>
          )}
        </div>
      </div>

      {loading ? <p className="p-4 text-center">Cargando sedes...</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSedes.map(sede => (
            <SedeCard key={sede.id} sede={sede} onEdit={handleOpenEditModal} onDelete={handleDeleteClick} />
          ))}
        </div>
      )}

      <SedeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleModalSuccess} itemToEdit={itemToEdit} listas={listas} />
      <ConfirmModal isOpen={itemToDelete !== null} onClose={() => setItemToDelete(null)} onConfirm={handleConfirmDelete} title="Eliminar Sede">
        <p>¿Seguro que quieres eliminar <strong>{itemToDelete?.nombre_sede}</strong>?</p>
      </ConfirmModal>
    </>
  );
}

export default SedesPage;