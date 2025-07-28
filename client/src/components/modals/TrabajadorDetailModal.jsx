import React from 'react';
import { FiX, FiMail, FiPhone, FiBriefcase, FiMapPin, FiCheckCircle, FiXCircle, FiCalendar } from 'react-icons/fi';

const getInitials = (name = '') => {
  if (!name) return '';
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

function TrabajadorDetailModal({ isOpen, onClose, trabajador }) {
  if (!isOpen) return null;

  const DetailItem = ({ icon, label, value }) => (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-1 flex items-center text-slate-700">{icon}{value || 'No especificado'}</p>
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
            <DetailItem icon={<FiBriefcase className="mr-2" />} label="Centro de Servicio" value={trabajador.centro} />
            <DetailItem icon={<FiMapPin className="mr-2" />} label="Sede (Oficina)" value={trabajador.sede} />
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Estado</p>
              <p className={`mt-1 flex items-center font-bold ${trabajador.estado === 'Alta' ? 'text-green-600' : 'text-red-600'}`}>
                {trabajador.estado === 'Alta' ? <FiCheckCircle className="mr-2"/> : <FiXCircle className="mr-2"/>}
                {trabajador.estado}
              </p>
            </div>
            <DetailItem icon={<FiCalendar className="mr-2" />} label="Fecha de Alta" value={trabajador.fecha_alta?.split('T')[0]} />
            {trabajador.fecha_baja && <DetailItem icon={<FiCalendar className="mr-2" />} label="Fecha de Baja" value={trabajador.fecha_baja?.split('T')[0]} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrabajadorDetailModal;