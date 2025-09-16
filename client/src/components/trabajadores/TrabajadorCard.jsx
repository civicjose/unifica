import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const getInitials = (name = '') => {
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  // Corregido para evitar error si no hay apellido
  const lastNameInitial = names[names.length - 1] ? names[names.length - 1].charAt(0) : '';
  return (names[0].charAt(0) + lastNameInitial).toUpperCase();
};

function TrabajadorCard({ trabajador, onViewDetails, onEditClick, onDeleteClick }) {
  const { user } = useAuth();

  const handleEdit = (e) => {
    e.stopPropagation();
    onEditClick(trabajador);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDeleteClick(trabajador);
  };

  return (
    <div onClick={() => onViewDetails(trabajador)} className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
      <div className="flex-grow p-4">
        <div className="flex items-start justify-between gap-2"> {/* Añadido gap-2 para un poco de espacio */}
          <div className="flex items-center min-w-0"> {/* <-- 1. Añadido min-w-0 para permitir que el contenedor se encoja */}
            <div className="mr-4 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-xl font-bold text-white">
              {getInitials(`${trabajador.nombre} ${trabajador.apellidos}`)}
            </div>
            <div className="min-w-0"> {/* <-- 2. Otro min-w-0 en el contenedor del texto */}
              <p className="font-bold text-slate-900 truncate">{trabajador.nombre} {trabajador.apellidos}</p>
              <p className="text-sm text-slate-500 truncate">{trabajador.email}</p>
            </div>
          </div>
          <div className="flex items-center flex-shrink-0"> {/* <-- 3. flex-shrink-0 para que los botones no se encojan */}
            {['Administrador', 'Técnico'].includes(user.rol) && (
              <button onClick={handleEdit} className="rounded-full p-2 text-blue-600 hover:bg-blue-100" title="Editar trabajador">
                <FiEdit2 className="h-5 w-5" />
              </button>
            )}
            {user.rol === 'Administrador' && (
              <button onClick={handleDelete} className="rounded-full p-2 text-red-600 hover:bg-red-100" title="Eliminar trabajador">
                <FiTrash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 border-t border-slate-200 pt-4 text-sm">
          {/* He eliminado el grid que tenías aquí porque estaba vacío y no se usaba */}
          <p className="text-xs font-semibold uppercase text-slate-400">Puesto</p>
          <p className="font-medium text-slate-700">{trabajador.puesto || 'No asignado'}</p>
        </div>
      </div>
    </div>
  );
}

export default TrabajadorCard;