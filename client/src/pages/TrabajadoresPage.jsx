import React, { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import trabajadoresService from '../services/trabajadoresService';
import { useAuth } from '../context/AuthContext';

import TrabajadoresTable from '../components/trabajadores/TrabajadoresTable';
import TrabajadorCard from '../components/trabajadores/TrabajadorCard';
import AddTrabajadorModal from '../components/modals/AddTrabajadorModal';
import EditTrabajadorModal from '../components/modals/EditTrabajadorModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import MultiSelectFilter from '../components/trabajadores/MultiSelectFilter';
import TrabajadorDetailModal from '../components/modals/TrabajadorDetailModal';

import { FiSearch, FiDownload } from 'react-icons/fi';

function TrabajadoresPage() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const [listOptions, setListOptions] = useState({
    puestos: [],
    sedes: [],
    centros: [],
    ubicaciones: [],
  });

  // Estados para modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [trabajadorToEdit, setTrabajadorToEdit] = useState(null);
  const [trabajadorToDelete, setTrabajadorToDelete] = useState(null);
  const [viewingTrabajador, setViewingTrabajador] = useState(null);

  // Estados para filtros y ordenación
  const [filters, setFilters] = useState({ search: '', ubicaciones: [], puestos: [] });
  const [sortConfig, setSortConfig] = useState({ key: 'apellidos', direction: 'ascending' });

  const fetchTrabajadores = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await trabajadoresService.getAllTrabajadores(token, filters);
      if (Array.isArray(data)) {
        setTrabajadores(data);
      } else {
        setTrabajadores([]);
        toast.error("Los datos recibidos de los trabajadores no son válidos.");
      }
    } catch (error) {
      toast.error("No se pudieron cargar los trabajadores.");
      setTrabajadores([]);
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  useEffect(() => {
    if (token) {
        Promise.all([
            trabajadoresService.getPuestos(token),
            trabajadoresService.getSedes(token),
            trabajadoresService.getCentros(token),
        ]).then(([puestosRes, sedesRes, centrosRes]) => {
            const sedesOptions = sedesRes.data.map(s => ({ value: `sede-${s.id}`, label: `Sede: ${s.nombre}` }));
            const centrosOptions = centrosRes.data.map(c => ({ value: `centro-${c.id}`, label: `Centro: ${c.nombre}` }));

            setListOptions({
                puestos: puestosRes.data.map(p => ({ value: p.id, label: p.nombre })),
                sedes: sedesRes.data.map(s => ({ value: s.id, label: s.nombre })),
                centros: centrosRes.data.map(c => ({ value: c.id, label: c.nombre })),
                ubicaciones: [...sedesOptions, ...centrosOptions],
            });
        }).catch(() => toast.error("No se pudieron cargar las listas para los filtros."));
    }
  }, [token]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTrabajadores();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchTrabajadores]);

  const sortedTrabajadores = useMemo(() => {
    let sortableItems = [...trabajadores];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key] || '';
        const valB = b[sortConfig.key] || '';
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [trabajadores, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (name, selected) => {
    setFilters(prev => ({ ...prev, [name]: selected ? selected.map(s => s.value) : [] }));
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleExportCSV = () => {
    if (sortedTrabajadores.length === 0) {
      toast.error("No hay datos para exportar.");
      return;
    }
    const csv = Papa.unparse(sortedTrabajadores);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
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
      await trabajadoresService.deleteTrabajador(trabajadorToDelete.id, token);
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
    fetchTrabajadores();
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Trabajadores</h1>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <button onClick={handleExportCSV} className="flex transform items-center justify-center gap-2 rounded-full bg-slate-600 px-5 py-2.5 font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <FiDownload /> Exportar
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="flex transform items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-purple-600 px-5 py-2.5 font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg">
            + Añadir Trabajador
          </button>
        </div>
      </div>
      
      <div className="mb-6 flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-lg sm:flex-row sm:items-center">
        <div className="relative flex-grow">
          <input type="text" placeholder="Buscar por nombre, apellidos, email..." className="w-full rounded-full border bg-white py-2 pl-10 pr-4" value={filters.search} onChange={handleSearchChange}/>
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <MultiSelectFilter options={listOptions.ubicaciones} placeholder="Filtrar por ubicación..." onChange={(s) => handleFilterChange('ubicaciones', s)} />
        <MultiSelectFilter options={listOptions.puestos} placeholder="Filtrar por puesto..." onChange={(s) => handleFilterChange('puestos', s)} />
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

      <AddTrabajadorModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onTrabajadorAdded={handleActionCompletion} listas={listOptions} />
      <EditTrabajadorModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onTrabajadorUpdated={handleActionCompletion} trabajador={trabajadorToEdit} listas={listOptions} />
      <ConfirmModal isOpen={trabajadorToDelete !== null} onClose={() => setTrabajadorToDelete(null)} onConfirm={handleConfirmDelete} title="Eliminar Trabajador">
        <p>¿Seguro que quieres eliminar a <strong>{trabajadorToDelete?.nombre} {trabajadorToDelete?.apellidos}</strong>?</p>
      </ConfirmModal>
      <TrabajadorDetailModal isOpen={viewingTrabajador !== null} onClose={() => setViewingTrabajador(null)} trabajador={viewingTrabajador} />
    </>
  );
}

export default TrabajadoresPage;