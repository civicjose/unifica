import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';

function AsignarContactosModal({ isOpen, onClose, onSuccess, aplicacion, contactosProveedor }) {
  const [selectedContactIds, setSelectedContactIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (isOpen && aplicacion) {
      setLoading(true);
      // Carga los contactos que ya están asignados a esta aplicación
      apiService.getAplicacionContactos(aplicacion.id, token)
        .then(res => {
          setSelectedContactIds(new Set(res.data));
        })
        .catch(() => toast.error('No se pudieron cargar los contactos asignados.'))
        .finally(() => setLoading(false));
    }
  }, [aplicacion, isOpen, token]);

  const handleCheckboxChange = (contactId) => {
    const newSelection = new Set(selectedContactIds);
    if (newSelection.has(contactId)) {
      newSelection.delete(contactId);
    } else {
      newSelection.add(contactId);
    }
    setSelectedContactIds(newSelection);
  };

  const handleSubmit = () => {
    const contactIdsArray = Array.from(selectedContactIds);
    toast.promise(
      apiService.setAplicacionContactos(aplicacion.id, contactIdsArray, token),
      {
        loading: 'Guardando asignaciones...',
        success: () => {
          onSuccess();
          return '¡Contactos actualizados!';
        },
        error: 'No se pudieron guardar los cambios.',
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-60">
      <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-2xl">
        <h3 className="text-2xl font-bold text-secondary mb-1">Asignar Contactos</h3>
        <p className="text-slate-600 mb-4">Para la aplicación: <strong>{aplicacion.nombre_aplicacion}</strong></p>
        
        <div className="max-h-[50vh] overflow-y-auto border-y py-4 my-4">
          {loading ? (
            <p>Cargando contactos...</p>
          ) : (
            <ul className="space-y-3">
              {contactosProveedor.map(contact => (
                <li key={contact.id}>
                  <label className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={selectedContactIds.has(contact.id)}
                      onChange={() => handleCheckboxChange(contact.id)}
                    />
                    <span className="ml-3 font-semibold text-slate-700">{contact.nombre}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-5 py-2 font-bold">Cancelar</button>
          <button type="button" onClick={handleSubmit} className="rounded-full bg-primary px-5 py-2 font-bold text-white">Guardar Asignación</button>
        </div>
      </div>
    </div>
  );
}

export default AsignarContactosModal;