import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import TrabajadoresTable from '../components/trabajadores/TrabajadoresTable';
import TrabajadorCard from '../components/trabajadores/TrabajadorCard';
import AddTrabajadorModal from '../components/modals/AddTrabajadorModal';
import EditTrabajadorModal from '../components/modals/EditTrabajadorModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import MultiSelectFilter from '../components/trabajadores/MultiSelectFilter';
import TrabajadorDetailModal from '../components/modals/TrabajadorDetailModal';
import ImportTrabajadoresModal from '../components/modals/ImportTrabajadoresModal';
import { FiSearch, FiDownload, FiUpload, FiPlus } from 'react-icons/fi';

const StatusFilter = ({ selected, onChange }) => {
  const statuses = ['Alta', 'Baja', 'Todos'];
  return (
    <div className="flex items-center rounded-full bg-slate-100 p-1">
      {statuses.map(status => (
        <button key={status} onClick={() => onChange(status)}
          className={`rounded-full px-4 py-1 text-sm font-semibold transition-colors
            ${selected === status 
              ? 'bg-white text-secondary shadow' 
              : 'text-slate-500 hover:bg-slate-200'
            }`}>
          {status}
        </button>
      ))}
    </div>
  );
};

function TrabajadoresPage() {
  const { token, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [allTrabajadores, setAllTrabajadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalListOptions, setModalListOptions] = useState({ 
    puestos: [], sedes: [], centros: [], departamentos: [], territorios: [] 
  });
  const [filterOptions, setFilterOptions] = useState({ ubicaciones: [], puestos: [] });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [trabajadorToEdit, setTrabajadorToEdit] = useState(null);
  const [trabajadorToDelete, setTrabajadorToDelete] = useState(null);
  const [viewingTrabajador, setViewingTrabajador] = useState(null);
  const [filters, setFilters] = useState({ search: '', ubicaciones: [], puestos: [], estado: 'Alta' });
  const [sortConfig, setSortConfig] = useState({ key: 'apellidos', direction: 'ascending' });

  const fetchAllData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [trabajadoresRes, puestosRes, sedesRes, centrosRes, deptosRes, territoriosRes] = await Promise.all([
        apiService.getAllTrabajadores(token, filters),
        apiService.getPuestos(token),
        apiService.getSedes(token),
        apiService.getCentros(token),
        apiService.getDepartamentos(token),
        apiService.getTerritorios(token),
      ]);

      const trabajadoresData = Array.isArray(trabajadoresRes.data) ? trabajadoresRes.data : [];
      setAllTrabajadores(trabajadoresData);

      setModalListOptions({
        puestos: puestosRes.data.map(p => ({ value: p.id, label: p.nombre })),
        sedes: sedesRes.data.map(s => ({ value: s.id, label: s.nombre_sede })),
        centros: centrosRes.data.map(c => ({ value: c.id, label: c.nombre_centro })),
        departamentos: deptosRes.data.map(d => ({ value: d.id, label: d.nombre })),
        territorios: territoriosRes.data.map(t => ({ value: t.id, label: t.codigo })),
      });
      
      const puestosUnicos = new Map(trabajadoresData.filter(t => t.puesto_id).map(t => [t.puesto_id, { value: t.puesto_id, label: t.puesto }]));
      const ubicacionesUnicas = new Map();
      trabajadoresData.forEach(t => {
        if (t.sede_id) ubicacionesUnicas.set(`sede-${t.sede_id}`, { value: `sede-${t.sede_id}`, label: `Sede: ${t.ubicacion}` });
        else if (t.centro_id) ubicacionesUnicas.set(`centro-${t.centro_id}`, { value: `centro-${t.centro_id}`, label: `Centro: ${t.ubicacion}` });
      });
      
      setFilterOptions({
        puestos: Array.from(puestosUnicos.values()).sort((a, b) => a.label.localeCompare(b.label)),
        ubicaciones: Array.from(ubicacionesUnicas.values()).sort((a, b) => a.label.localeCompare(b.label)),
      });

    } catch (error) {
      toast.error("No se pudieron cargar los datos iniciales.");
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);
  
  useEffect(() => {
    if (location.state?.openAddModal) {
      setIsAddModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const filteredAndSortedTrabajadores = useMemo(() => {
    let items = [...allTrabajadores];
    if (sortConfig.key) {
      items.sort((a, b) => {
        const valA = a[sortConfig.key] || '';
        const valB = b[sortConfig.key] || '';
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [allTrabajadores, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (name, selected) => setFilters(prev => ({ ...prev, [name]: selected ? selected.map(s => s.value) : [] }));
  const handleSearchChange = (e) => setFilters(prev => ({ ...prev, search: e.target.value }));
  const handleStatusChange = (status) => setFilters(prev => ({ ...prev, estado: status }));
  
  const handleExportCSV = () => {
    if (filteredAndSortedTrabajadores.length === 0) {
      toast.error("No hay datos para exportar.");
      return;
    }
    const csv = Papa.unparse(filteredAndSortedTrabajadores);
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'trabajadores.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Datos exportados a CSV.");
  };

  const handleEditClick = (trabajador) => { setTrabajadorToEdit(trabajador); setIsEditModalOpen(true); };
  const handleDeleteClick = (trabajador) => { setTrabajadorToDelete(trabajador); };
  const handleViewDetails = (trabajador) => { setViewingTrabajador(trabajador); };

  const handleConfirmDelete = async () => {
    if (!trabajadorToDelete) return;
    try {
      await apiService.deleteTrabajador(trabajadorToDelete.id, token);
      toast.success('Trabajador eliminado.');
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar.');
    } finally {
      setTrabajadorToDelete(null);
    }
  };

  const handleActionCompletion = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsImportModalOpen(false);
    fetchAllData();
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Trabajadores</h1>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {['Administrador', 'Técnico'].includes(user.rol) && (
            <>
              <button onClick={() => setIsImportModalOpen(true)} className="flex transform items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-2.5 font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <FiUpload /> Importar
              </button>
              <button onClick={handleExportCSV} className="flex transform items-center justify-center gap-2 rounded-full bg-slate-600 px-5 py-2.5 font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <FiDownload /> Exportar
              </button>
              <button onClick={() => setIsAddModalOpen(true)} className="flex transform items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-purple-600 px-5 py-2.5 font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <FiPlus/> Añadir Trabajador
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="mb-6 flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-lg sm:flex-row sm:items-center">
        <div className="relative flex-grow">
          <input type="text" placeholder="Buscar..." className="w-full rounded-full border bg-white py-2 pl-10 pr-4" value={filters.search} onChange={handleSearchChange}/>
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <MultiSelectFilter options={filterOptions.ubicaciones} placeholder="Filtrar por ubicación..." onChange={(s) => handleFilterChange('ubicaciones', s)} />
        <MultiSelectFilter options={filterOptions.puestos} placeholder="Filtrar por puesto..." onChange={(s) => handleFilterChange('puestos', s)} />
        <StatusFilter selected={filters.estado} onChange={handleStatusChange} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
        {loading ? <p className="p-4 text-center">Cargando...</p> : (
          <>
            <div className="grid grid-cols-1 gap-6 md:hidden">
              {filteredAndSortedTrabajadores.map(t => <TrabajadorCard key={t.id} trabajador={t} onViewDetails={handleViewDetails} onEditClick={handleEditClick} onDeleteClick={handleDeleteClick} />)}
            </div>
            <div className="hidden md:block">
              <TrabajadoresTable trabajadores={filteredAndSortedTrabajadores} onViewDetails={handleViewDetails} onEditClick={handleEditClick} onDeleteClick={handleDeleteClick} requestSort={requestSort} sortConfig={sortConfig} />
            </div>
          </>
        )}
      </div>

      <AddTrabajadorModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onTrabajadorAdded={handleActionCompletion} listas={modalListOptions} />
      <EditTrabajadorModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onTrabajadorUpdated={handleActionCompletion} trabajador={trabajadorToEdit} listas={modalListOptions} />
      <ConfirmModal isOpen={trabajadorToDelete !== null} onClose={() => setTrabajadorToDelete(null)} onConfirm={handleConfirmDelete} title="Eliminar Trabajador">
        <p>¿Seguro que quieres eliminar a <strong>{trabajadorToDelete?.nombre} {trabajadorToDelete?.apellidos}</strong>?</p>
      </ConfirmModal>
      <TrabajadorDetailModal isOpen={viewingTrabajador !== null} onClose={() => setViewingTrabajador(null)} trabajador={viewingTrabajador} />
      <ImportTrabajadoresModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImportSuccess={handleActionCompletion} />
    </>
  );
}

export default TrabajadoresPage;