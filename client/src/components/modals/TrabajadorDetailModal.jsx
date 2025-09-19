import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import glpiService from '../../services/glpiService';
import apiService from '../../services/apiService';
import HistorialModificacionesModal from './HistorialModificacionesModal';
import GastosTrabajadorModal from './GastosTrabajadorModal';
import { FiX, FiMail, FiPhone, FiArchive, FiMapPin, FiCheckCircle, FiXCircle, FiCalendar, FiFileText, FiMap, FiHardDrive, FiExternalLink, FiClock, FiShoppingCart } from 'react-icons/fi';

const getInitials = (name = '') => {
  if (!name) return '';
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  const lastNameInitial = names[names.length - 1] ? names[names.length - 1].charAt(0) : '';
  return (names[0].charAt(0) + lastNameInitial).toUpperCase();
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
};

const formatCurrency = (number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(number);

function TrabajadorDetailModal({ isOpen, onClose, trabajador }) {
  const { token } = useAuth();
  const [computerName, setComputerName] = useState(null);
  const [loadingComputer, setLoadingComputer] = useState(false);
  const [isHistorialOpen, setIsHistorialOpen] = useState(false);
  const [isGastosModalOpen, setIsGastosModalOpen] = useState(false);
  const [gastos, setGastos] = useState([]);
  const [loadingGastos, setLoadingGastos] = useState(false);

  useEffect(() => {
    if (isOpen && trabajador?.id) {
      setLoadingComputer(true);
      setComputerName(null);
      setLoadingGastos(true);
      
      const fetchComputer = async () => {
        if (!trabajador.email) {
            setLoadingComputer(false);
            return;
        }
        try {
          const data = await glpiService.getComputerByEmail(trabajador.email, token);
          setComputerName(data.computerName);
        } catch (error) {
          setComputerName(null);
        } finally {
          setLoadingComputer(false);
        }
      };

      const fetchGastos = async () => {
        try {
            const res = await apiService.getGastosByTrabajador(trabajador.id, token);
            setGastos(res.data);
        } catch (error) {
            setGastos([]);
        } finally {
            setLoadingGastos(false);
        }
      };

      fetchComputer();
      fetchGastos();
    }
  }, [isOpen, trabajador, token]);

  if (!isOpen) return null;

  const createGlpiLink = (name) => {
    const baseUrl = 'https://sistemas.macrosad.com/front/computer.php';
    const params = new URLSearchParams({
      is_deleted: '0', as_map: '0', browse: '0',
      'criteria[0][link]': 'AND', 'criteria[0][field]': '1',
      'criteria[0][searchtype]': 'contains', 'criteria[0][value]': name,
      itemtype: 'Computer',
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const DetailItem = ({ icon, label, value, children }) => (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <div className="mt-1 flex items-center text-slate-700">
        {icon}
        <div className="ml-2 break-all">{children || value || 'No especificado'}</div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
        <div className="w-full max-w-4xl rounded-xl bg-white shadow-2xl">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 p-4 rounded-t-xl">
            <h3 className="text-xl font-semibold text-secondary">Ficha de Trabajador</h3>
            <div className="flex items-center gap-2 sm:gap-4">
              {!loadingGastos && gastos.length > 0 && (
                <button 
                  onClick={() => setIsGastosModalOpen(true)}
                  className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-200"
                  title="Ver gastos asociados"
                >
                  <FiShoppingCart className="h-4 w-4" /> 
                  <span className="hidden sm:inline">Ver Gastos</span>
                </button>
              )}
              <button 
                onClick={() => setIsHistorialOpen(true)}
                className="flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-300"
                title="Ver historial de cambios"
              >
                <FiClock className="h-4 w-4" /> 
                <span className="hidden sm:inline">Historial</span>
              </button>
              <button onClick={onClose} className="text-3xl font-light text-gray-400 hover:text-gray-800">&times;</button>
            </div>
          </div>
          
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row items-center mb-6">
              <div className="mb-4 sm:mb-0 sm:mr-6 flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-4xl font-bold text-white">
                {getInitials(`${trabajador.nombre} ${trabajador.apellidos}`)}
              </div>
              <div className="text-center sm:text-left">
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 break-words">{trabajador.nombre} {trabajador.apellidos}</p>
                <p className="mt-1 text-lg text-slate-500">{trabajador.puesto || 'Puesto no asignado'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6 border-t border-slate-200 pt-6">
              <DetailItem icon={<FiMail />} label="Email" value={trabajador.email} />
              <DetailItem icon={<FiPhone />} label="Teléfono" value={trabajador.telefono} />
              <DetailItem icon={<FiMapPin />} label="Ubicación" value={trabajador.ubicacion} />
              {trabajador.territorio && <DetailItem icon={<FiMap />} label="Territorio (DT)" value={trabajador.territorio} />}
              {trabajador.departamento && <DetailItem icon={<FiArchive />} label="Departamento" value={trabajador.departamento} />}
               <DetailItem icon={<FiHardDrive />} label="Equipo Asignado (GLPI)">
                {loadingComputer ? (
                  <span className="text-slate-400">Buscando...</span>
                ) : computerName ? (
                  <a href={createGlpiLink(computerName)} target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:text-purple-600">
                    {computerName} <FiExternalLink className="ml-1 h-4 w-4 flex-shrink-0" />
                  </a>
                ) : 'No asignado'}
              </DetailItem>
              <DetailItem label="Estado">
                    <p className={`flex items-center font-semibold ${trabajador.estado === 'Alta' ? 'text-green-600' : 'text-red-600'}`}>
                        {trabajador.estado === 'Alta' ? <FiCheckCircle className="mr-2"/> : <FiXCircle className="mr-2"/>}
                        {trabajador.estado}
                        {trabajador.fecha_baja && <span className="ml-2 text-sm font-normal text-slate-500">({formatDate(trabajador.fecha_baja)})</span>}
                    </p>
              </DetailItem>
              <DetailItem icon={<FiCalendar />} label="Fecha de Alta" value={formatDate(trabajador.fecha_alta)} />
              {trabajador.observaciones && (
                <div className="lg:col-span-2">
                  <DetailItem icon={<FiFileText />} label="Observaciones">
                      <p className="whitespace-pre-wrap">{trabajador.observaciones}</p>
                  </DetailItem>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <HistorialModificacionesModal
        isOpen={isHistorialOpen}
        onClose={() => setIsHistorialOpen(false)}
        entidad="trabajadores"
        entidadId={trabajador?.id}
        entidadNombre={`${trabajador?.nombre} ${trabajador?.apellidos}`}
      />
      <GastosTrabajadorModal
        isOpen={isGastosModalOpen}
        onClose={() => setIsGastosModalOpen(false)}
        gastos={gastos}
        trabajadorNombre={`${trabajador?.nombre} ${trabajador?.apellidos}`}
      />
    </>
  );
}

export default TrabajadorDetailModal;