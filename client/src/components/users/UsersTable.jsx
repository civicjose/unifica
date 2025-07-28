import React, { useState, useEffect, useRef } from 'react';
import { FiTrash2, FiEdit2, FiArrowUp, FiArrowDown, FiMoreVertical } from 'react-icons/fi';

const SortIcon = ({ direction }) => {
  if (direction === 'ascending') return <FiArrowUp className="ml-1 inline" size={14} />;
  if (direction === 'descending') return <FiArrowDown className="ml-1 inline" size={14} />;
  return null;
};

const getInitials = (name) => {
  if (!name) return '';
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

function UsersTable({ users, onEditClick, onDeleteClick, requestSort, sortConfig }) {
  const [openMenuId, setOpenMenuId] = useState(null); // Estado para saber qué menú está abierto
  const menuRef = useRef(null);

  // Cierra el menú si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuToggle = (userId) => {
    setOpenMenuId(openMenuId === userId ? null : userId);
  };
  
  const SortableHeader = ({ field, label }) => (
    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
      <button onClick={() => requestSort(field)} className="flex items-center transition-colors hover:text-slate-800">
        {label}
        {sortConfig.key === field && <SortIcon direction={sortConfig.direction} />}
      </button>
    </th>
  );

  if (users.length === 0) {
    return <p className="p-4 text-center text-gray-500">No se encontraron usuarios.</p>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-slate-50">
          <tr>
            <SortableHeader field="nombre_completo" label="Usuario" />
            <SortableHeader field="rol" label="Rol" />
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {users.map((user) => (
            <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center">
                  <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-white">
                    {getInitials(user.nombre_completo)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{user.nombre_completo}</div>
                    <div className="text-sm text-slate-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className="rounded-full bg-primary bg-opacity-20 px-3 py-1 text-sm font-semibold leading-tight text-primary">
                  {user.rol}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right">
                {/* --- NUEVO MENÚ DE ACCIONES --- */}
                <div className="relative inline-block text-left" ref={openMenuId === user.id ? menuRef : null}>
                  <button
                    onClick={() => handleMenuToggle(user.id)}
                    className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-200"
                    title="Más acciones"
                  >
                    <FiMoreVertical className="h-5 w-5" />
                  </button>

                  {/* Menú desplegable */}
                  {openMenuId === user.id && (
                    <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <button
                          onClick={() => { onEditClick(user); setOpenMenuId(null); }}
                          className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        >
                          <FiEdit2 className="mr-3" /> Editar
                        </button>
                        <button
                          onClick={() => { onDeleteClick(user); setOpenMenuId(null); }}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <FiTrash2 className="mr-3" /> Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersTable;