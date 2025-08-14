import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiMapPin, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function SedeCard({ sede, onEdit, onDelete }) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col rounded-xl border bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* El enlace ahora envuelve la parte principal de la tarjeta */}
      <Link to={`/sedes/${sede.id}`} className="flex-grow p-6 block">
        <h3 className="text-xl font-bold text-secondary truncate">{sede.nombre_sede}</h3>
        <div className="mt-2 flex items-center text-sm text-slate-500">
          <FiMapPin className="mr-2 h-4 w-4 flex-shrink-0" />
          <span>{sede.localidad || 'Localidad no especificada'}, {sede.provincia}</span>
        </div>
      </Link>
      
      <div className="flex justify-between items-center border-t p-4">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {sede.territorio_codigo || 'DT no asignado'}
        </span>
        {user.rol === 'Administrador' && (
          <div className="flex gap-2">
            <button onClick={() => onEdit(sede)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Editar Sede"><FiEdit2 /></button>
            <button onClick={() => onDelete(sede)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Eliminar Sede"><FiTrash2 /></button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SedeCard;