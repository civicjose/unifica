import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiPhone, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function ProveedorListItemCard({ proveedor, onEdit, onDelete }) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col rounded-xl border bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <Link to={`/proveedores/${proveedor.id}`} className="flex-grow p-6 block">
        <h3 className="text-xl font-bold text-secondary truncate">{proveedor.nombre_proveedor}</h3>
        <div className="mt-2 flex items-center text-sm text-slate-500">
          <FiMail className="mr-2 h-4 w-4 flex-shrink-0" />
          <span>{proveedor.email || 'Sin email'}</span>
        </div>
        <div className="mt-1 flex items-center text-sm text-slate-500">
          <FiPhone className="mr-2 h-4 w-4 flex-shrink-0" />
          <span>{proveedor.telefono || 'Sin teléfono'}</span>
        </div>
      </Link>
      
      {user.rol === 'Administrador' && (
        <div className="flex justify-end items-center border-t p-4">
          <div className="flex gap-2">
            <button onClick={() => onEdit(proveedor)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Editar Proveedor"><FiEdit2 /></button>
            <button onClick={() => onDelete(proveedor)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Eliminar Proveedor"><FiTrash2 /></button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProveedorListItemCard;