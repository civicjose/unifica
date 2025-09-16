import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import glpiService from '../../services/glpiService';
import HistorialModificacionesModal from './HistorialModificacionesModal';
import { FiX, FiMail, FiPhone, FiArchive, FiMapPin, FiCheckCircle, FiXCircle, FiCalendar, FiFileText, FiMap, FiHardDrive, FiExternalLink, FiClock } from 'react-icons/fi';

const getInitials = (name = '') => {
  if (!name) return '';
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  const lastNameInitial = names[names.length - 1] ? names[names.length - 1].charAt(0) : '';
  return (names[0].charAt(0) + lastNameInitial).toUpperCase();
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('T')[0].split('-');
  return `${day}-${month}-${year}`;
};

function TrabajadorDetailModal({ isOpen, onClose, trabajador }) {
  const { token } = useAuth();
  const [computerName, setComputerName] = useState(null);
  const [loadingComputer, setLoadingComputer] = useState(false);
  const [isHistorialOpen, setIsHistorialOpen] = useState(false);

  useEffect(() => {
    if (isOpen && trabajador?.email) {
      setLoadingComputer(true);
      setComputerName(null);

      const fetchComputer = async () => {
        try {
          const data = await glpiService.getComputerByEmail(trabajador.email, token);
          setComputerName(data.computerName);
        } catch (error) {
          setComputerName(null);
        } finally {
          setLoadingComputer(false);
        }
      };

      fetchComputer();
    }
  }, [isOpen, trabajador, token]);

  if (!isOpen) return null;

  const createGlpiLink = (name) => {
    const baseUrl = 'https://sistemas.macrosad.com/front/computer.php';
    const params = new URLSearchParams({
      is_deleted: '0',
      as_map: '0',
      browse: '0',
      'criteria[0][link]': 'AND',
      'criteria[0][field]': '1',
      'criteria[0][searchtype]': 'contains',
      'criteria[0][value]': name,
      itemtype: 'Computer',
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const DetailItem = ({ icon, label, value, children }) => (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <div className="mt-1 flex items-center text-slate-700">
        {icon}
        {children || value || 'No especificado'}
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
        <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
          {/* --- INICIO DE LA CORRECCIÓN FINAL --- */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 p-4 rounded-t-xl">
            <h3 className="text-2xl font-semibold text-secondary">Ficha de Trabajador</h3>
            <div className="flex items-center gap-2 sm:gap-4">
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
          {/* --- FIN DE LA CORRECCIÓN FINAL --- */}
          
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="mb-4 sm:mb-0 sm:mr-6 flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-4xl font-bold text-white">
                {getInitials(`${trabajador.nombre} ${trabajador.apellidos}`)}
              </div>
              <div className="text-center sm:text-left">
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 break-words">{trabajador.nombre} {trabajador.apellidos}</p>
                <p className="mt-1 text-lg text-slate-500">{trabajador.puesto || 'Puesto no asignado'}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 border-t border-slate-200 pt-6 sm:grid-cols-2">
              <DetailItem icon={<FiMail className="mr-2" />} label="Email" value={trabajador.email} />
              
              <DetailItem icon={<FiHardDrive className="mr-2" />} label="Equipo Asignado (GLPI)">
                {loadingComputer ? (
                  <span className="text-slate-400">Buscando...</span>
                ) : computerName ? (
                  <a
                    href={createGlpiLink(computerName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-primary hover:text-purple-600 break-all"
                  >
                    {computerName} <FiExternalLink className="ml-1 h-4 w-4 flex-shrink-0" />
                  </a>
                ) : (
                  'No asignado'
                )}
              </DetailItem>
              
              <DetailItem icon={<FiPhone className="mr-2" />} label="Teléfono" value={trabajador.telefono} />
              <DetailItem icon={<FiMapPin className="mr-2" />} label="Ubicación" value={trabajador.ubicacion} />
              
              {trabajador.territorio && (
                <DetailItem icon={<FiMap className="mr-2" />} label="Territorio (DT)" value={trabajador.territorio} />
              )}

              {trabajador.departamento && (
                <DetailItem icon={<FiArchive className="mr-2" />} label="Departamento" value={trabajador.departamento} />
              )}

              <div>
                <DetailItem label="Estado">
                    <p className={`flex items-center font-bold ${trabajador.estado === 'Alta' ? 'text-green-600' : 'text-red-600'}`}>
                        {trabajador.estado === 'Alta' ? <FiCheckCircle className="mr-2"/> : <FiXCircle className="mr-2"/>}
                        {trabajador.estado}
                        {trabajador.fecha_baja && <span className="ml-2 text-sm font-normal text-slate-500">({formatDate(trabajador.fecha_baja)})</span>}
                    </p>
                </DetailItem>
              </div>
              <DetailItem icon={<FiCalendar className="mr-2" />} label="Fecha de Alta" value={formatDate(trabajador.fecha_alta)} />
              
              {trabajador.observaciones && (
                <div className="sm:col-span-2">
                  <DetailItem icon={<FiFileText className="mr-2 mt-1 self-start flex-shrink-0" />} label="Observaciones">
                      <p className="whitespace-pre-wrap text-slate-700">{trabajador.observaciones}</p>
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
    </>
  );
}

export default TrabajadorDetailModal;