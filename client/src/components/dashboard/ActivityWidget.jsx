import React from 'react';
import { FiClock, FiEdit, FiPlus, FiTrash2 } from 'react-icons/fi';

const ActivityIcon = ({ action }) => {
  switch (action) {
    case 'CREATE': return <FiPlus className="h-5 w-5 text-green-500" />;
    case 'UPDATE': return <FiEdit className="h-5 w-5 text-blue-500" />;
    case 'DELETE': return <FiTrash2 className="h-5 w-5 text-red-500" />;
    default: return <FiEdit className="h-5 w-5 text-gray-500" />;
  }
};

const formatActionText = (item) => {
    const actionMap = {
        'CREATE': 'ha creado',
        'UPDATE': 'ha actualizado',
        'DELETE': 'ha eliminado'
    };
    const entityMap = {
        'trabajadores': 'al trabajador',
        'centros': 'el centro',
        'sedes': 'la sede',
        'proveedores': 'al proveedor'
    };

    const actionText = actionMap[item.tipo_accion] || 'ha modificado';
    const entityText = entityMap[item.entidad_modificada] || `el registro en ${item.entidad_modificada}`;
    const entityName = item.entidad_nombre ? `'${item.entidad_nombre}'` : '';

    return (
        <p>
            <span className="font-bold">{item.usuario}</span> {actionText} {entityText} <span className="font-semibold text-primary">{entityName}</span>.
        </p>
    );
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return `hace ${Math.floor(interval)} años`;
  interval = seconds / 2592000;
  if (interval > 1) return `hace ${Math.floor(interval)} meses`;
  interval = seconds / 86400;
  if (interval > 1) return `hace ${Math.floor(interval)} días`;
  interval = seconds / 3600;
  if (interval > 1) return `hace ${Math.floor(interval)} horas`;
  interval = seconds / 60;
  if (interval > 1) return `hace ${Math.floor(interval)} minutos`;
  return `hace unos segundos`;
};

function ActivityWidget({ activities }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm h-full">
      <div className="flex items-center mb-4">
        <FiClock className="h-6 w-6 text-secondary mr-3" />
        <h3 className="text-lg font-bold text-secondary">Actividad Reciente</h3>
      </div>
      <ul className="space-y-4">
        {activities && activities.map(item => (
          <li key={item.id} className="flex items-start">
            <div className="flex-shrink-0 mr-3 mt-1">
              <ActivityIcon action={item.tipo_accion} />
            </div>
            <div className="flex-grow text-sm text-slate-700">
              {formatActionText(item)}
              <p className="text-xs text-slate-400">{formatTimeAgo(item.fecha_modificacion)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ActivityWidget;