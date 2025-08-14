import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiMapPin, FiTag, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function CentroCard({ centro, onEdit, onDelete }) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col rounded-xl border bg-white shadow-sm transition-all hover:shadow-xl">
      <Link to={`/centros/${centro.id}`} className="flex-grow p-6 block">
        <h3 className="text-xl font-bold text-secondary truncate">{centro.nombre_centro}</h3>
        <div className="mt-2 flex items-center text-sm text-slate-500">
          <FiMapPin className="mr-2 h-4 w-4" />
          <span>{centro.localidad}, {centro.provincia}</span>
        </div>
        <div className="mt-1 flex items-center text-sm text-slate-500">
          <FiTag className="mr-2 h-4 w-4" />
          <span>{centro.tipo_centro || 'Tipo no definido'}</span>
        </div>
      </Link>
      
      {/* Botones de Admin */}
      {user.rol === 'Administrador' && (
        <div className="flex justify-between items-center border-t p-4">
           <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {centro.territorio_codigo || 'DT no asignado'}
            </span>
          <div className="flex gap-2">
            <button onClick={() => onEdit(centro)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><FiEdit2 /></button>
            <button onClick={() => onDelete(centro)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><FiTrash2 /></button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CentroCard;