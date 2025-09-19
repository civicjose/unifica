import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';
import { FiUsers, FiCheckSquare, FiSquare } from 'react-icons/fi';

function AsignarContactosModal({ isOpen, onClose, aplicacion, contactosProveedor }) {
  const { token } = useAuth();
  const [selectedContactos, setSelectedContactos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && aplicacion) {
      setLoading(true);
      apiService.getAplicacionContactos(aplicacion.id, token)
        .then(res => {
          setSelectedContactos(res.data.map(c => c.id));
        })
        .catch(() => toast.error('No se pudieron cargar los contactos asignados.'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, aplicacion, token]);

  const handleToggleContacto = (contactId) => {
    setSelectedContactos(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSubmit = () => {
    toast.promise(
      apiService.setAplicacionContactos(aplicacion.id, selectedContactos, token),
      {
        loading: 'Guardando...',
        success: () => {
          onClose();
          return '¡Cambios guardados!';
        },
        error: 'No se pudieron guardar los cambios.',
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-2xl font-semibold text-secondary flex items-center">
              <FiUsers className="mr-3"/>
              Asignar Contactos
            </h3>
            <p className="text-slate-500 mt-1">{aplicacion?.nombre_aplicacion}</p>
          </div>
          <button onClick={onClose} className="text-3xl font-light text-gray-400 hover:text-gray-800">&times;</button>
        </div>

        <div className="mt-4 max-h-[50vh] overflow-y-auto pr-2">
            {loading ? <p>Cargando...</p> : (
                <ul className="space-y-2">
                    {contactosProveedor.map(contacto => {
                        const isSelected = selectedContactos.includes(contacto.id);
                        return (
                            <li key={contacto.id} onClick={() => handleToggleContacto(contacto.id)}
                                className="flex items-center p-3 rounded-lg cursor-pointer transition-colors border bg-slate-50 hover:bg-primary/10">
                                {isSelected ? 
                                    <FiCheckSquare className="h-6 w-6 text-primary flex-shrink-0"/> : 
                                    <FiSquare className="h-6 w-6 text-slate-400 flex-shrink-0"/>
                                }
                                <div className="ml-4">
                                    <p className="font-semibold text-slate-800">{contacto.nombre}</p>
                                    <p className="text-sm text-slate-500">{contacto.cargo}</p>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>

        <div className="flex justify-end gap-4 border-t border-slate-200 pt-4 mt-6">
            <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-5 py-2 font-bold">Cancelar</button>
            <button type="button" onClick={handleSubmit} className="rounded-full bg-primary px-5 py-2 font-bold text-white">Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
}

export default AsignarContactosModal;