import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import historialService from '../../services/historialService.js';
import { FiX } from 'react-icons/fi';
import toast from 'react-hot-toast'; // Importamos toast

// 1. Mapa para traducir los nombres de los campos de la BD a un formato legible
const friendlyFieldNames = {
  nombre: 'Nombre',
  apellidos: 'Apellidos',
  email: 'Email',
  telefono: 'Teléfono',
  puesto_id: 'Puesto',
  sede_id: 'Sede',
  centro_id: 'Centro',
  departamento_id: 'Departamento',
  territorio_id: 'Territorio (DT)',
  estado: 'Estado',
  fecha_alta: 'Fecha de Alta',
  fecha_baja: 'Fecha de Baja',
  observaciones: 'Observaciones',
};

// 2. Función mejorada para formatear valores
const formatValue = (campo, value) => {
  if (value === null || value === undefined || value === '') {
    return <span className="text-slate-400">Vacío</span>;
  }

  // Si el campo es una fecha, ahora podemos confiar en que es un string YYYY-MM-DD
  if ((campo === 'fecha_alta' || campo === 'fecha_baja') && typeof value === 'string') {
    // Tomamos solo la parte de la fecha, por si acaso viniera con hora
    const datePart = value.split('T')[0];
    const parts = datePart.split('-');
    
    // Validamos que tenga el formato YYYY-MM-DD
    if (parts.length === 3 && parts[0].length === 4) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
  }

  return String(value);
};


const formatDateTime = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

function HistorialModificacionesModal({ isOpen, onClose, entidad, entidadId, entidadNombre }) {
  const { token } = useAuth();
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && entidad && entidadId) {
      setLoading(true);
      historialService.getHistorial(entidad, entidadId, token)
        .then(data => setHistorial(data))
        .catch(() => toast.error('No se pudo cargar el historial.'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, entidad, entidadId, token]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60">
      <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-2xl font-semibold text-secondary">Historial de Cambios</h3>
            <p className="text-slate-500">{entidadNombre}</p>
          </div>
          <button onClick={onClose} className="text-3xl font-light text-gray-400 hover:text-gray-800">&times;</button>
        </div>
        
        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <p className="text-center text-slate-500">Cargando historial...</p>
          ) : historial.length === 0 ? (
            <p className="text-center text-slate-500">No hay modificaciones registradas.</p>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Usuario</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Campo Modificado</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Valor Anterior</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Valor Nuevo</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {historial.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{formatDateTime(item.fecha_modificacion)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-800 font-medium">{item.usuario_modificador || 'Sistema'}</td>
                    {/* 3. Usamos el mapa de nombres amigables */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-800 font-semibold">
                      {friendlyFieldNames[item.campo_modificado] || item.campo_modificado}
                    </td>
                    {/* 4. Usamos la función de formato para los valores */}
                    <td className="px-4 py-3 text-sm text-red-700">{formatValue(item.campo_modificado, item.valor_anterior)}</td>
                    <td className="px-4 py-3 text-sm text-green-700">{formatValue(item.campo_modificado, item.valor_nuevo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistorialModificacionesModal;