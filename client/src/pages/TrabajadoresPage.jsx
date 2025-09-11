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
import BuscadorFiltro from '../components/trabajadores/BuscadorFiltro';
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
  
  const [filterOptions, setFilterOptions] = useState({ 
    ubicaciones: [], puestos: [] 
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [trabajadorToEdit, setTrabajadorToEdit] = useState(null);
  const [trabajadorToDelete, setTrabajadorToDelete] = useState(null);
  const [viewingTrabajador, setViewingTrabajador] = useState(null);
  const [filters, setFilters] = useState({ search: '', ubicaciones: [], puestos: [], estado: 'Alta' });
  const [sortConfig, setSortConfig] = useState({ key: 'apellidos', direction: 'ascending' });
  
  const [ubicacionesSeleccionadas, setUbicacionesSeleccionadas] = useState([]);
  const [puestosSeleccionados, setPuestosSeleccionados] = useState([]);

  useEffect(() => {
    const fetchMasterData = async () => {
      if (!token) return;
      try {
        const [puestosRes, sedesRes, centrosRes, deptosRes, territoriosRes] = await Promise.all([
          apiService.getPuestos(token),
          apiService.getSedes(token),
          apiService.getCentros(token),
          apiService.getDepartamentos(token),
          apiService.getTerritorios(token),
        ]);

        setModalListOptions({
          puestos: puestosRes.data.map(p => ({ value: p.id, label: p.nombre })),
          sedes: sedesRes.data.map(s => ({ value: s.id, label: s.nombre_sede })),
          centros: centrosRes.data.map(c => ({ value: c.id, label: c.nombre_centro })),
          departamentos: deptosRes.data.map(d => ({ value: d.id, label: d.nombre })),
          territorios: territoriosRes.data.map(t => ({ value: t.id, label: t.codigo })),
        });
        
        const allPuestosOptions = puestosRes.data.map(p => ({ value: p.id, label: p.nombre }));
        const allUbicacionesOptions = [
          ...sedesRes.data.map(s => ({ value: `sede-${s.id}`, label: `Sede: ${s.nombre_sede}` })),
          ...centrosRes.data.map(c => ({ value: `centro-${c.id}`, label: `Centro: ${c.nombre_centro}` }))
        ].sort((a, b) => a.label.localeCompare(b.label));
        
        setFilterOptions({
          puestos: allPuestosOptions,
          ubicaciones: allUbicacionesOptions,
        });

      } catch (error) {
        toast.error("No se pudieron cargar las opciones de filtrado.");
      }
    };
    fetchMasterData();
  }, [token]);

  const fetchTrabajadores = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const trabajadoresRes = await apiService.getAllTrabajadores(token, filters);
      setAllTrabajadores(Array.isArray(trabajadoresRes.data) ? trabajadoresRes.data : []);
    } catch (error) {
      toast.error("No se pudieron cargar los trabajadores.");
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  useEffect(() => {
    fetchTrabajadores();
  }, [fetchTrabajadores]);
  
  useEffect(() => {
    if (location.state?.openAddModal) {
      setIsAddModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const sortedTrabajadores = useMemo(() => {
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

  const handleSearchChange = (e) => setFilters(prev => ({ ...prev, search: e.target.value }));
  const handleStatusChange = (status) => setFilters(prev => ({ ...prev, estado: status }));
  
  const handleUbicacionesChange = (selectedOptions) => {
    setUbicacionesSeleccionadas(selectedOptions || []);
    setFilters(prev => ({ ...prev, ubicaciones: selectedOptions ? selectedOptions.map(s => s.value) : [] }));
  };
  const handlePuestosChange = (selectedOptions) => {
    setPuestosSeleccionados(selectedOptions || []);
    setFilters(prev => ({ ...prev, puestos: selectedOptions ? selectedOptions.map(s => s.value) : [] }));
  };
  
  const handleExportCSV = () => {
    if (sortedTrabajadores.length === 0) {
      toast.error("No hay datos para exportar.");
      return;
    }

    const dataToExport = sortedTrabajadores.map(t => ({
      'Nombre': t.nombre,
      'Apellidos': t.apellidos,
      'Email': t.email,
      'Teléfono': t.telefono,
      'Puesto': t.puesto,
      'Ubicación': t.ubicacion,
      'Departamento': t.departamento,
      'Territorio (DT)': t.territorio,
      'Estado': t.estado,
      'Fecha de Alta': t.fecha_alta,
      'Fecha de Baja': t.fecha_baja,
      'Observaciones': t.observaciones,
    }));

    // --- CAMBIO CLAVE AQUÍ ---
    // Añadimos la opción 'delimiter' para usar punto y coma
    const csv = Papa.unparse(dataToExport, {
        header: true,
        delimiter: ";", // Le indicamos que el separador sea ';'
    });

    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'trabajadores_unifica.csv');
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
      fetchTrabajadores();
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
    fetchTrabajadores();
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
          <input type="text" placeholder="Buscar por nombre, apellidos, email..." className="w-full rounded-full border bg-white py-2 pl-10 pr-4" value={filters.search} onChange={handleSearchChange}/>
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <BuscadorFiltro 
          options={filterOptions.ubicaciones} 
          placeholder="Filtrar por ubicación..." 
          value={ubicacionesSeleccionadas}
          onChange={handleUbicacionesChange} 
        />
        <BuscadorFiltro 
          options={filterOptions.puestos} 
          placeholder="Filtrar por puesto..." 
          value={puestosSeleccionados}
          onChange={handlePuestosChange}
        />
        <StatusFilter selected={filters.estado} onChange={handleStatusChange} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
        {loading ? <p className="p-4 text-center">Cargando...</p> : (
          <>
            <div className="grid grid-cols-1 gap-6 md:hidden">
              {sortedTrabajadores.map(t => <TrabajadorCard key={t.id} trabajador={t} onViewDetails={handleViewDetails} onEditClick={handleEditClick} onDeleteClick={handleDeleteClick} />)}
            </div>
            <div className="hidden md:block">
              <TrabajadoresTable trabajadores={sortedTrabajadores} onViewDetails={handleViewDetails} onEditClick={handleEditClick} onDeleteClick={handleDeleteClick} requestSort={requestSort} sortConfig={sortConfig} />
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