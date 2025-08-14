import React from 'react';
import { FiEdit, FiTrash2, FiBox, FiTruck, FiCpu, FiMonitor } from 'react-icons/fi';

const renderDetalles = (detalles) => {
  if (!detalles) return null;
  const formatLabel = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="mt-3 space-y-2 text-sm">
      {Object.entries(detalles).map(([key, value]) => (
        <div key={key} className="flex">
          <p className="w-1/3 font-semibold text-slate-500">{formatLabel(key)}:</p>
          <p className="w-2/3 text-slate-700">{value}</p>
        </div>
      ))}
    </div>
  );
};
function ProveedorCard({ proveedorInfo, onEdit, onDelete }) {
  const getIcon = (categoria) => {
    switch (categoria?.toLowerCase()) {
      case 'comunicaciones': return <FiBox className="h-6 w-6 text-white" />;
      case 'cctv': return <FiCpu className="h-6 w-6 text-white" />;
      case 'software sociosanitario': return <FiMonitor className="h-6 w-6 text-white" />;
      default: return <FiTruck className="h-6 w-6 text-white" />;
    }
  };

  const tituloPrincipal = proveedorInfo.nombre_aplicacion || proveedorInfo.nombre_proveedor;
  const subTitulo = proveedorInfo.nombre_aplicacion ? proveedorInfo.nombre_proveedor : null;

  return (
    <div className="bg-slate-50/70 rounded-lg p-4 border">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
            {getIcon(proveedorInfo.categoria)}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-primary">{proveedorInfo.categoria}</p>
            <h4 className="text-lg font-bold text-slate-800">{tituloPrincipal}</h4>
            {subTitulo && <p className="text-sm text-slate-500">Prov: {subTitulo}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit(proveedorInfo)} className="p-2 text-slate-500 hover:text-blue-600" title="Editar"><FiEdit /></button>
          <button onClick={() => onDelete(proveedorInfo)} className="p-2 text-slate-500 hover:text-red-600" title="Desvincular"><FiTrash2 /></button>
        </div>
      </div>
      {renderDetalles(proveedorInfo.detalles)}
    </div>
  );
}

export default ProveedorCard;