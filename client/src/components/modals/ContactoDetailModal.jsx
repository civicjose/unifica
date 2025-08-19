import React from 'react';
import { FiX, FiUser, FiBriefcase, FiMail, FiPhone, FiFileText } from 'react-icons/fi';

const DetailRow = ({ icon, label, children }) => (
    <div>
        <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
        <div className="mt-1 flex items-center text-slate-700">
            {icon}
            <span className="ml-2 break-all">{children || '-'}</span>
        </div>
    </div>
);

function ContactoDetailModal({ isOpen, onClose, contacto }) {
  if (!isOpen || !contacto) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-60">
      <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-2xl font-bold text-secondary">Ficha de Contacto</h3>
            <button onClick={onClose} className="text-3xl font-light text-gray-400">&times;</button>
        </div>
        <div className="mt-4 space-y-4">
            <DetailRow icon={<FiUser />} label="Nombre">{contacto.nombre}</DetailRow>
            <DetailRow icon={<FiBriefcase />} label="Cargo">{contacto.cargo}</DetailRow>
            <DetailRow icon={<FiMail />} label="Email">{contacto.email}</DetailRow>
            <DetailRow icon={<FiPhone />} label="Teléfono">{contacto.telefono}</DetailRow>
            {contacto.observaciones && (
                <DetailRow icon={<FiFileText />} label="Observaciones">
                    <p className="whitespace-pre-wrap">{contacto.observaciones}</p>
                </DetailRow>
            )}
        </div>
      </div>
    </div>
  );
}

export default ContactoDetailModal;