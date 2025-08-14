import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiEdit } from 'react-icons/fi';

const AlertItem = ({ to, children }) => (
  <li className="py-3 flex justify-between items-center transition-colors hover:bg-slate-50 -mx-2 px-2 rounded-md">
    <span className="text-slate-700">{children}</span>
    <Link to={to} className="text-primary hover:text-purple-600 flex-shrink-0 ml-4" title="Ir a la ficha">
      <FiEdit />
    </Link>
  </li>
);

function AlertsWidget({ alerts }) {
  const hasAlerts = alerts && alerts.length > 0;

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm h-full">
      <div className="flex items-center mb-4">
        <FiAlertTriangle className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0" />
        <h3 className="text-lg font-bold text-secondary">Atención Requerida</h3>
      </div>

      {hasAlerts ? (
        <ul className="divide-y divide-slate-200">
          {alerts.map(item => (
            <AlertItem key={`${item.tipo}-${item.id}`} to={`/${item.tipo.toLowerCase()}s/${item.id}`}>
              <p className="font-semibold text-slate-800">{item.nombre}</p>
              <p className="text-sm text-red-600">Falta: {item.faltante}</p>
            </AlertItem>
          ))}
        </ul>
      ) : (
        <div className="text-center py-4">
          <p className="font-semibold text-green-600">¡Todo en orden!</p>
          <p className="text-slate-500 text-sm">No hay alertas pendientes.</p>
        </div>
      )}
    </div>
  );
}

export default AlertsWidget;