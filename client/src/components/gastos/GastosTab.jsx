import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';
import GastoModal from '../modals/GastoModal';
import ConfirmModal from '../modals/ConfirmModal';
import GastoCard from './GastoCard';
import { FiPlus, FiDownload, FiCalendar, FiSearch } from 'react-icons/fi';

function GastosTab({ sedeId, centroId }) {
  const { token, user } = useAuth();
  const [gastos, setGastos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalGastos, setTotalGastos] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [gastoToDelete, setGastoToDelete] = useState(null);
  const [filtros, setFiltros] = useState({ fecha_inicio: '', fecha_fin: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sede_id: sedeId, centro_id: centroId, ...filtros };
      const [gastosRes, proveedoresRes, trabajadoresRes] = await Promise.all([
          apiService.getGastos(params, token),
          apiService.getProveedores(token),
          apiService.getAllTrabajadores(token)
      ]);
      setGastos(gastosRes.data);
      setProveedores(proveedoresRes.data);
      setTrabajadores(trabajadoresRes.data);
    } catch (error) {
      toast.error('No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
    }
  }, [sedeId, centroId, token, filtros]);

  useEffect(() => { loadData(); }, [loadData]);
  
  const filteredGastos = useMemo(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    
    const gastosFiltrados = gastos.filter(gasto =>
        (gasto.concepto?.toLowerCase().includes(lowercasedTerm)) ||
        (gasto.nombre_proveedor?.toLowerCase().includes(lowercasedTerm)) ||
        (gasto.trabajador_nombre?.toLowerCase().includes(lowercasedTerm))
    );

    const total = gastosFiltrados.reduce((sum, gasto) => sum + parseFloat(gasto.importe), 0);
    setTotalGastos(total);

    return gastosFiltrados;
  }, [gastos, searchTerm]);

  const handleExport = async () => {
    if (filteredGastos.length === 0) {
        toast.error("No hay datos para exportar.");
        return;
    }
    toast.loading('Generando CSV...');
    try {
        const params = { sede_id: sedeId, centro_id: centroId, ...filtros };
        const response = await apiService.exportGastos(params, token);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `gastos_${sedeId || centroId}.csv`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        toast.dismiss();
        toast.success('¡Exportación completada!');
    } catch (error) {
        toast.dismiss();
        toast.error('Error al exportar los datos.');
    }
  };

  const handleOpenAddModal = () => {
    setItemToEdit(null);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (gasto) => {
    setItemToEdit(gasto);
    setIsModalOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!gastoToDelete) return;
    toast.promise(apiService.deleteGasto(gastoToDelete.id, token), {
        loading: 'Eliminando...',
        success: () => {
            setGastoToDelete(null);
            loadData();
            return 'Gasto eliminado.';
        },
        error: 'No se pudo eliminar el gasto.'
    });
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    loadData();
  };

  const formatCurrency = (number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(number);
  const inputDateStyle = "w-full bg-white border rounded-md px-3 py-1.5 text-sm";
  const labelDateStyle = "text-xs font-semibold text-slate-500 mb-1 block";

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between md:items-start">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="w-full sm:w-auto">
                    <label className={labelDateStyle}>Fecha Inicio</label>
                    <input type="date" name="fecha_inicio" onChange={(e) => setFiltros({...filtros, fecha_inicio: e.target.value})} className={inputDateStyle}/>
                </div>
                <div className="w-full sm:w-auto">
                    <label className={labelDateStyle}>Fecha Fin</label>
                    <input type="date" name="fecha_fin" onChange={(e) => setFiltros({...filtros, fecha_fin: e.target.value})} className={inputDateStyle}/>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <button onClick={handleExport} className="flex items-center justify-center gap-2 rounded-full bg-slate-600 px-4 py-2 text-sm font-bold text-white shadow-md">
                    <FiDownload/> Exportar
                </button>
                {['Administrador', 'Técnico'].includes(user.rol) && (
                    <button onClick={handleOpenAddModal} className="flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-md">
                        <FiPlus/> Nuevo Gasto
                    </button>
                )}
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="relative md:col-span-2">
                 <input
                    type="text"
                    placeholder="Buscar por concepto, proveedor o trabajador..."
                    className="w-full rounded-full border bg-white py-2 pl-10 pr-4 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-2 flex justify-between items-center text-center">
                <h3 className="text-md font-bold text-secondary ml-2">Total Filtrado</h3>
                <p className="text-xl font-bold text-secondary mr-2">{formatCurrency(totalGastos)}</p>
            </div>
        </div>

        {loading ? (
          <p className="p-4 text-center text-slate-500">Cargando gastos...</p>
        ) : filteredGastos.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No se encontraron gastos con los filtros actuales.</p>
        ) : (
          <div className="space-y-4">
            {filteredGastos.map(gasto => (
              <GastoCard 
                key={gasto.id} 
                gasto={gasto}
                onEdit={handleOpenEditModal}
                onDelete={setGastoToDelete}
              />
            ))}
          </div>
        )}
      </div>

      <GastoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        sedeId={sedeId}
        centroId={centroId}
        itemToEdit={itemToEdit}
        proveedores={proveedores}
        trabajadores={trabajadores}
      />
      <ConfirmModal
        isOpen={gastoToDelete !== null}
        onClose={() => setGastoToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Gasto"
      >
        <p>¿Estás seguro de que deseas eliminar el gasto <strong>"{gastoToDelete?.concepto}"</strong>? Esta acción no se puede deshacer.</p>
      </ConfirmModal>
    </>
  );
}

export default GastosTab;