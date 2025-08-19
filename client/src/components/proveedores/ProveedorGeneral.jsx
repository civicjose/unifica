import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';
import { FiSave } from 'react-icons/fi';

function ProveedorGeneral({ proveedor, onUpdate }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (proveedor) {
      setFormData(proveedor);
    }
  }, [proveedor]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    toast.promise(
      apiService.updateProveedor(proveedor.id, formData, token),
      {
        loading: 'Guardando cambios...',
        success: () => {
          onUpdate(); // Llama a la función para recargar los datos
          return '¡Proveedor actualizado con éxito!';
        },
        error: 'No se pudieron guardar los cambios.',
      }
    ).finally(() => setLoading(false));
  };

  const inputStyle = "w-full rounded-lg border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition";
  const labelStyle = "mb-1 block text-sm font-semibold text-slate-600";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelStyle}>Nombre del Proveedor</label>
          <input type="text" name="nombre_proveedor" value={formData.nombre_proveedor || ''} onChange={handleChange} className={inputStyle} required />
        </div>
        <div>
          <label className={labelStyle}>Página Web</label>
          <input type="url" name="url_proveedor" value={formData.url_proveedor || ''} onChange={handleChange} className={inputStyle} placeholder="https://..." />
        </div>
        <div>
          <label className={labelStyle}>Teléfono General</label>
          <input type="tel" name="telefono" value={formData.telefono || ''} onChange={handleChange} className={inputStyle} />
        </div>
        <div>
          <label className={labelStyle}>Email General</label>
          <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className={inputStyle} />
        </div>
      </div>
      <div>
        <label className={labelStyle}>Observaciones Generales</label>
        <textarea name="observaciones" value={formData.observaciones || ''} onChange={handleChange} className={inputStyle} rows="4"></textarea>
      </div>
      <div className="flex justify-end pt-4 border-t">
        <button type="submit" className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-bold text-white shadow-md hover:bg-primary/90" disabled={loading}>
          <FiSave /> {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}

export default ProveedorGeneral;