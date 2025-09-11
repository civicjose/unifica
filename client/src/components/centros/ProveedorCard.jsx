import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiEdit, FiTrash2, FiBox, FiTruck, FiCpu, FiMonitor, FiUsers } from 'react-icons/fi';

// La función para renderizar los detalles ahora usa la definición de campos para encontrar la etiqueta original
const renderDetalles = (detalles, camposDefinicion) => {
  if (!detalles || !camposDefinicion || camposDefinicion.length === 0) return null;

  // Creamos un mapa para buscar la etiqueta original de forma eficiente
  const labelMap = new Map(camposDefinicion.map(campo => [campo.name, campo.label]));

  return (
    <div className="mt-3 space-y-2 text-sm">
      {Object.entries(detalles).map(([key, value]) => (
        <div key={key} className="flex">
          <p className="w-1/3 font-semibold text-slate-500">{labelMap.get(key) || key}:</p>
          <p className="w-2/3 text-slate-700">{value}</p>
        </div>
      ))}
    </div>
  );
};


function ProveedorCard({ proveedorInfo, onEdit, onDelete, onContactClick, camposDefinicion = [] }) {
  const { user } = useAuth();

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
          {user.rol !== 'Usuario' && onEdit && (
            <button onClick={() => onEdit(proveedorInfo)} className="p-2 text-slate-500 hover:text-blue-600" title="Editar"><FiEdit /></button>
          )}
          {user.rol === 'Administrador' && onDelete && (
            <button onClick={() => onDelete(proveedorInfo)} className="p-2 text-slate-500 hover:text-red-600" title="Desvincular"><FiTrash2 /></button>
          )}
        </div>
      </div>
      
      {Array.isArray(proveedorInfo.aplicacion_contactos) && proveedorInfo.aplicacion_contactos.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200">
           <div className="flex items-start text-sm">
             <FiUsers className="h-4 w-4 mr-2 text-slate-500 flex-shrink-0 mt-1" />
             <div>
                <p className="font-semibold mb-1">Contactos App:</p>
                <div className="flex flex-wrap gap-2">
                  {proveedorInfo.aplicacion_contactos.map(contacto => (
                    <button 
                      key={contacto.id} 
                      onClick={() => onContactClick(contacto)}
                      className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full hover:bg-blue-200"
                    >
                      {contacto.nombre}
                    </button>
                  ))}
                </div>
             </div>
           </div>
        </div>
      )}

      {renderDetalles(proveedorInfo.detalles, camposDefinicion)}
    </div>
  );
}

export default ProveedorCard;