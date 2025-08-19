import React, { useState, useEffect } from 'react';

const initialState = {
  nombre: '',
  cargo: '',
  email: '',
  telefono: '',
  observaciones: ''
};

function ContactoModal({ isOpen, onClose, onSubmit, itemToEdit }) {
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setFormData(itemToEdit);
      } else {
        setFormData(initialState);
      }
    }
  }, [itemToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // La lógica de guardado la manejará el componente padre
  };

  if (!isOpen) return null;

  const inputStyle = "w-full rounded-lg border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 shadow-sm";
  const labelStyle = "mb-1 block text-sm font-semibold text-slate-600";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60">
      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-2xl">
        <h3 className="text-2xl font-bold text-secondary mb-4">{itemToEdit ? 'Editar' : 'Añadir'} Contacto</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Nombre Completo</label>
              <input type="text" name="nombre" value={formData.nombre || ''} onChange={handleChange} className={inputStyle} required />
            </div>
            <div>
              <label className={labelStyle}>Cargo</label>
              <input type="text" name="cargo" value={formData.cargo || ''} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Email</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Teléfono</label>
              <input type="tel" name="telefono" value={formData.telefono || ''} onChange={handleChange} className={inputStyle} />
            </div>
          </div>
          <div>
            <label className={labelStyle}>Observaciones</label>
            <textarea name="observaciones" value={formData.observaciones || ''} onChange={handleChange} className={inputStyle} rows="3"></textarea>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-5 py-2 font-bold">Cancelar</button>
            <button type="submit" className="rounded-full bg-primary px-5 py-2 font-bold text-white">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContactoModal;