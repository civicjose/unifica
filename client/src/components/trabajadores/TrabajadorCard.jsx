import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext'; // Importamos useAuth

const getInitials = (name = '') => {
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

function TrabajadorCard({ trabajador, onViewDetails, onEditClick, onDeleteClick }) {
  const { user } = useAuth();

  return (
    <div onClick={() => onViewDetails(trabajador)} className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
      <div className="flex-grow p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="mr-4 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-xl font-bold text-white">
              {getInitials(`${trabajador.nombre} ${trabajador.apellidos}`)}
            </div>
            <div>
              <p className="font-bold text-slate-900">{trabajador.nombre} {trabajador.apellidos}</p>
              <p className="text-sm text-slate-500">{trabajador.email}</p>
            </div>
          </div>
          <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
            {['Administrador', 'Técnico'].includes(user.rol) && (
              <button onClick={() => onEditClick(trabajador)} className="rounded-full p-2 text-blue-600 hover:bg-blue-100" title="Editar trabajador">
                <FiEdit2 className="h-5 w-5" />
              </button>
            )}
            {user.rol === 'Administrador' && (
              <button onClick={() => onDeleteClick(trabajador)} className="rounded-full p-2 text-red-600 hover:bg-red-100" title="Eliminar trabajador">
                <FiTrash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 text-sm">
        </div>
      </div>
    </div>
  );
}

export default TrabajadorCard;