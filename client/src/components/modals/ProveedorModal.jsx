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
  
  // --- ESTILO CORREGIDO Y UNIFICADO ---
  const inputStyle = "w-full rounded-lg border-slate-300 bg-slate-100 px-4 py-2.5 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition";
  const labelStyle = "mb-1 block text-sm font-semibold text-slate-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-2xl font-bold text-secondary">{itemToEdit ? 'Editar' : 'Añadir'} Proveedor</h3>
            <button onClick={onClose} className="text-3xl font-light text-gray-400 hover:text-gray-800">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Nombre</label>
              <input type="text" name="nombre_proveedor" value={formData.nombre_proveedor || ''} onChange={handleChange} className={inputStyle} required />
            </div>
            <div>
              <label className={labelStyle}>Página Web</label>
              <input type="url" name="url_proveedor" value={formData.url_proveedor || ''} onChange={handleChange} className={inputStyle} placeholder="https://..." />
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
          <div className="flex justify-end gap-4 pt-4 mt-6 border-t">
            <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-5 py-2 font-bold text-slate-700">Cancelar</button>
            <button type="submit" className="rounded-full bg-primary px-5 py-2 font-bold text-white">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProveedorModal;