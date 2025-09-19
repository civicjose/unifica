import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiEdit2, FiTrash2, FiUsers, FiExternalLink, FiUser } from 'react-icons/fi';

function AplicacionCard({ aplicacion, onEdit, onDelete, onAssignContacts }) {
  const { user } = useAuth();

  const ensureProtocol = (url) => {
    if (!url) return '#';
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  };

  return (
    <div className="flex flex-col rounded-xl border bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex-grow p-5">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-secondary truncate">{aplicacion.nombre_aplicacion}</h3>
            {aplicacion.url_aplicacion && (
              <a href={ensureProtocol(aplicacion.url_aplicacion)} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-blue-600 hover:underline mt-1">
                <FiExternalLink className="mr-1.5" />
                <span>Ir a la aplicación</span>
              </a>
            )}
          </div>
          <div className="flex flex-shrink-0 gap-1">
            {['Administrador', 'Técnico'].includes(user.rol) && (
              <button onClick={() => onEdit(aplicacion)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Editar Aplicación">
                <FiEdit2 size={16}/>
              </button>
            )}
            {user.rol === 'Administrador' && (
              <button onClick={() => onDelete(aplicacion)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Eliminar Aplicación">
                <FiTrash2 size={16}/>
              </button>
            )}
          </div>
        </div>
        
        {aplicacion.descripcion && (
          <p className="text-sm text-slate-600 mt-3 whitespace-pre-wrap">{aplicacion.descripcion}</p>
        )}

        <div className="mt-4 pt-4 border-t">
          <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">Contactos Asignados</h4>
          {aplicacion.contactosAsignados && aplicacion.contactosAsignados.length > 0 ? (
            <ul className="space-y-2">
              {aplicacion.contactosAsignados.map(contacto => (
                <li key={contacto.id} className="flex items-center">
                  <FiUser className="h-4 w-4 mr-2 text-slate-500 flex-shrink-0"/>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{contacto.nombre}</p>
                    <p className="text-xs text-slate-500">{contacto.cargo}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Sin contactos asignados.</p>
          )}
        </div>
      </div>
      
      <div className="border-t bg-slate-50/50 p-3 rounded-b-xl">
        <button onClick={() => onAssignContacts(aplicacion)} className="w-full flex items-center justify-center gap-2 rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-300">
          <FiUsers />
          Gestionar Contactos
        </button>
      </div>
    </div>
  );
}

export default AplicacionCard;