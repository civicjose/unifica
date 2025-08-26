import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';

const initialState = {
  nombre_sede: '', 
  direccion: '', 
  codigo_postal: '', 
  localidad: '', 
  provincia: '', 
  telefono: '', 
  territorio_id: '',
  observaciones: '', 
  repositorio_fotografico: ''
};

function SedeModal({ isOpen, onClose, onSuccess, itemToEdit, listas }) {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        // Si estamos editando, llenamos el formulario con los datos existentes
        setFormData({
          nombre_sede: itemToEdit.nombre_sede || '',
          direccion: itemToEdit.direccion || '',
          codigo_postal: itemToEdit.codigo_postal || '',
          localidad: itemToEdit.localidad || '',
          provincia: itemToEdit.provincia || '',
          telefono: itemToEdit.telefono || '',
          territorio_id: itemToEdit.territorio_id || '',
          observaciones: itemToEdit.observaciones || '',
          repositorio_fotografico: itemToEdit.repositorio_fotografico || ''
        });
      } else {
        // Si estamos creando, reseteamos al estado inicial
        setFormData(initialState);
      }
    }
  }, [itemToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const promise = itemToEdit 
      ? apiService.updateSede(itemToEdit.id, formData, token)
      : apiService.createSede(formData, token);

    toast.promise(promise, {
      loading: 'Guardando...',
      success: () => {
        onSuccess();
        return '¡Guardado con éxito!';
      },
      error: 'Error al guardar la sede.',
    }).finally(() => setLoading(false));
  };

  if (!isOpen) return null;
  
  const inputStyle = "w-full rounded-lg border-slate-300 bg-slate-100 px-3 py-2 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition";
  const labelStyle = "mb-1 block text-sm font-semibold text-slate-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="w-full max-w-3xl bg-white p-6 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="text-2xl font-bold text-secondary">{itemToEdit ? 'Editar' : 'Añadir'} Sede</h3>
          <button onClick={onClose} className="text-3xl font-light text-gray-400 hover:text-gray-800">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-4 max-h-[70vh] overflow-y-auto pr-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Nombre de la Sede</label>
              <input type="text" name="nombre_sede" value={formData.nombre_sede || ''} onChange={handleChange} className={inputStyle} required />
            </div>
            <div>
              <label className={labelStyle}>Teléfono</label>
              <input type="tel" name="telefono" value={formData.telefono || ''} onChange={handleChange} className={inputStyle} />
            </div>
            <div className="md:col-span-2">
              <label className={labelStyle}>Dirección</label>
              <input type="text" name="direccion" value={formData.direccion || ''} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Código Postal</label>
              <input type="text" name="codigo_postal" value={formData.codigo_postal || ''} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Localidad</label>
              <input type="text" name="localidad" value={formData.localidad || ''} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Provincia</label>
              <input type="text" name="provincia" value={formData.provincia || ''} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Territorio</label>
              <select name="territorio_id" value={formData.territorio_id || ''} onChange={handleChange} className={inputStyle}>
                <option value="">-- No asignado --</option>
                {listas.territorios.map(t => <option key={t.id} value={t.id}>{t.codigo}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label className={labelStyle}>Observaciones</label>
            <textarea name="observaciones" value={formData.observaciones || ''} onChange={handleChange} className={inputStyle} rows="4"></textarea>
          </div>
          <div>
            <label className={labelStyle}>Repositorio Fotográfico (URL)</label>
            <input type="url" name="repositorio_fotografico" value={formData.repositorio_fotografico || ''} onChange={handleChange} className={inputStyle} placeholder="https://..." />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-5 py-2 font-bold text-slate-700">Cancelar</button>
            <button type="submit" className="rounded-full bg-primary px-5 py-2 font-bold text-white" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SedeModal;