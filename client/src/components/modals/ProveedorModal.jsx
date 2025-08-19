import React, { useState, useEffect } from 'react';

const initialState = { nombre_proveedor: '', url_proveedor: '', telefono: '', email: '', observaciones: '' };

function ProveedorModal({ isOpen, onClose, onSubmit, itemToEdit }) {
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (isOpen) setFormData(itemToEdit || initialState);
  }, [itemToEdit, isOpen]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); };

  if (!isOpen) return null;
  const inputStyle = "w-full rounded-lg border-slate-300";
  const labelStyle = "mb-1 block text-sm font-semibold";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="w-full max-w-2xl bg-white p-6 rounded-xl">
        <h3 className="text-2xl font-bold mb-4">{itemToEdit ? 'Editar' : 'Añadir'} Proveedor</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Nombre</label>
              <input type="text" name="nombre_proveedor" value={formData.nombre_proveedor || ''} onChange={handleChange} className={inputStyle} required />
            </div>
            <div>
              <label className={labelStyle}>Página Web</label>
              <input type="url" name="url_proveedor" value={formData.url_proveedor || ''} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Teléfono</label>
              <input type="tel" name="telefono" value={formData.telefono || ''} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Email</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className={inputStyle} />
            </div>
          </div>
          <div>
            <label className={labelStyle}>Observaciones</label>
            <textarea name="observaciones" value={formData.observaciones || ''} onChange={handleChange} className={inputStyle} rows="3"></textarea>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProveedorModal;