import React from 'react';
import { FiTrash2, FiEdit2 } from 'react-icons/fi';

const getInitials = (name) => {
  if (!name) return '';
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

function UserCard({ user, onEditClick, onDeleteClick }) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex flex-grow flex-col p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="mr-4 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-xl font-bold text-white">
              {getInitials(user.nombre_completo)}
            </div>
            <div>
              <p className="font-bold text-slate-900">{user.nombre_completo}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEditClick(user)}
              className="rounded-full p-2 text-blue-600 hover:bg-blue-100"
              title="Editar usuario"
            >
              <FiEdit2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDeleteClick(user)}
              className="rounded-full p-2 text-red-600 hover:bg-red-100"
              title="Eliminar usuario"
            >
              <FiTrash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Rol</p>
          <span className="mt-1 inline-block rounded-full bg-primary bg-opacity-20 px-3 py-1 text-sm font-semibold leading-tight text-primary">
            {user.rol}
          </span>
        </div>
      </div>
    </div>
  );
}

export default UserCard;