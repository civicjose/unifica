import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiMail, FiPhone, FiFileText } from 'react-icons/fi';
import ContactoModal from '../modals/ContactoModal';
import ConfirmModal from '../modals/ConfirmModal';

const ContactoCard = ({ contacto, onEdit, onDelete }) => {
  const { user } = useAuth();
  return (
    <div className="bg-slate-50/70 rounded-lg p-4 border">
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-secondary text-white flex items-center justify-center">
            <FiUser className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 text-lg truncate">{contacto.nombre}</p>
            <p className="text-sm text-primary font-semibold truncate">{contacto.cargo || 'Cargo no especificado'}</p>
          </div>
        </div>
        <div className="flex flex-shrink-0 gap-1">
         {['Administrador', 'Técnico'].includes(user.rol) && (
            <button onClick={() => onEdit(contacto)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Editar Contacto"><FiEdit2 size={16}/></button>
          )}
          {user.rol === 'Administrador' && (
            <button onClick={() => onDelete(contacto)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Eliminar Contacto"><FiTrash2 size={16}/></button>
          )}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-sm">
        <div className="flex items-center text-slate-600">
          <FiMail className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="break-all">{contacto.email || '-'}</span>
        </div>
        <div className="flex items-center text-slate-600">
          <FiPhone className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{contacto.telefono || '-'}</span>
        </div>
        {contacto.observaciones && (
          <div className="flex items-start text-slate-600">
            <FiFileText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <p className="whitespace-pre-wrap">{contacto.observaciones}</p>
          </div>
        )}
      </div>
    </div>
  );
};

function ProveedorContactos({ proveedorId, contactos, onUpdate }) {
  const { token, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleOpenAddModal = () => { setItemToEdit(null); setIsModalOpen(true); };
  const handleOpenEditModal = (contacto) => { setItemToEdit(contacto); setIsModalOpen(true); };

  const handleSubmit = (formData) => {
    const promise = itemToEdit
      ? apiService.updateContact(itemToEdit.id, formData, token)
      : apiService.createContact(proveedorId, formData, token);

    toast.promise(promise, {
      loading: 'Guardando...',
      success: () => {
        setIsModalOpen(false);
        onUpdate();
        return '¡Contacto guardado!';
      },
      error: 'No se pudo guardar el contacto.',
    });
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    toast.promise(apiService.deleteContact(itemToDelete.id, token), {
      loading: 'Eliminando...',
      success: () => {
        setItemToDelete(null);
        onUpdate();
        return 'Contacto eliminado.';
      },
      error: (err) => err.response?.data?.message || 'Error al eliminar.',
    });
  };

  return (
    <>
      {['Administrador', 'Técnico'].includes(user.rol) && (
        <div className="flex justify-end mb-4">
          <button onClick={handleOpenAddModal} className="flex items-center gap-2 rounded-full bg-primary text-white px-4 py-2 text-sm font-bold shadow-md">
            <FiPlus /> Añadir Contacto
          </button>
        </div>
      )}
      
      {contactos && contactos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contactos.map(contacto => (
            <ContactoCard 
              key={contacto.id}
              contacto={contacto}
              onEdit={handleOpenEditModal}
              onDelete={() => setItemToDelete(contacto)}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500 p-8">No hay contactos registrados para este proveedor.</p>
      )}
      
      <ContactoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} itemToEdit={itemToEdit} />
      <ConfirmModal isOpen={itemToDelete !== null} onClose={() => setItemToDelete(null)} onConfirm={handleConfirmDelete} title="Eliminar Contacto">
        <p>¿Seguro que quieres eliminar a <strong>{itemToDelete?.nombre}</strong>?</p>
      </ConfirmModal>
    </>
  );
}

export default ProveedorContactos;