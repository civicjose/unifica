import React from 'react';
// He reemplazado FiBuilding por FiArchive aquí y he quitado FiBriefcase que no se usaba
import { FiX, FiMail, FiPhone, FiArchive, FiMapPin, FiCheckCircle, FiXCircle, FiCalendar, FiFileText } from 'react-icons/fi';

const getInitials = (name = '') => {
  if (!name) return '';
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('T')[0].split('-');
  return `${day}-${month}-${year}`;
};

function TrabajadorDetailModal({ isOpen, onClose, trabajador }) {
  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4 rounded-t-xl">
          <h3 className="text-2xl font-semibold text-secondary">Ficha de Trabajador</h3>
          <button onClick={onClose} className="text-3xl font-light text-gray-400 hover:text-gray-800"><FiX /></button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center">
            <div className="mr-6 flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-4xl font-bold text-white">
              {getInitials(`${trabajador.nombre} ${trabajador.apellidos}`)}
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{trabajador.nombre} {trabajador.apellidos}</p>
              <p className="mt-1 text-lg text-slate-500">{trabajador.puesto || 'Puesto no asignado'}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 border-t border-slate-200 pt-6 sm:grid-cols-2">
            <DetailItem icon={<FiMail className="mr-2" />} label="Email" value={trabajador.email} />
            <DetailItem icon={<FiPhone className="mr-2" />} label="Teléfono" value={trabajador.telefono} />
            <DetailItem icon={<FiMapPin className="mr-2" />} label="Ubicación" value={trabajador.ubicacion} />
            
            {/* --- CORRECCIÓN AQUÍ: Usamos el icono FiArchive --- */}
            {trabajador.departamento && (
              <DetailItem icon={<FiArchive className="mr-2" />} label="Departamento" value={trabajador.departamento} />
            )}

            <div className={trabajador.departamento ? '' : 'sm:col-span-2'}>
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
  );
}

export default TrabajadorDetailModal;