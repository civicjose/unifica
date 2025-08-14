import React from 'react';
import { FiCheckSquare } from 'react-icons/fi';

const ProgressBar = ({ label, value, max }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-semibold text-slate-600">{label}</span>
        <span className="text-sm font-bold text-primary">{value} / {max}</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div 
          className="bg-primary h-2.5 rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

function CompletenessWidget({ data }) {
  if (!data) return null;

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm h-full">
      <div className="flex items-center mb-4">
        <FiCheckSquare className="h-6 w-6 text-blue-500 mr-3" />
        <h3 className="text-lg font-bold text-secondary">Estado de los Datos</h3>
      </div>
      <div className="space-y-4">
        <ProgressBar label="Sedes con Teléfono" value={data.sedes.con_telefono} max={data.sedes.total} />
        <ProgressBar label="Sedes con Repositorio" value={data.sedes.con_repo} max={data.sedes.total} />
        <ProgressBar label="Centros con Repositorio" value={data.centros.con_repo} max={data.centros.total} />
        <ProgressBar label="Trabajadores con Puesto" value={data.trabajadores.con_puesto} max={data.trabajadores.total} />
      </div>
    </div>
  );
}

export default CompletenessWidget;