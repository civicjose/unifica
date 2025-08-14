import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';

// Define las categorías y los campos específicos para cada una.
// Esto centraliza la configuración del formulario en un solo lugar.
const CATEGORIAS = {
  'Comunicaciones': [
    { name: 'linea_contratada', label: 'Línea Contratada', type: 'text' },
    { name: 'firewall', label: 'Firewall', type: 'text' },
    { name: 'datos_wifi', label: 'Datos WIFI', type: 'textarea' },
    { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
  ],
  'CCTV': [
    { name: 'descripcion_sistema', label: 'Descripción del Sistema', type: 'textarea' },
    { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
  ],
  'Software Sociosanitario': [
    { name: 'descripcion_sistema', label: 'Descripción del Sistema', type: 'textarea' },
    { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
  ],
  'Alerta Paciente-Enfermera': [
    { name: 'descripcion_sistema', label: 'Descripción del Sistema', type: 'textarea' },
    { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
  ],
};

const initialState = {
  categoria: '',
  proveedor_id: '',
  aplicacion_id: '',
  detalles: {}
};

function AddProveedorModal({ isOpen, onClose, onSuccess, centroId, sedeId, proveedores, aplicaciones, itemToEdit }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);

  // Carga los datos si estamos en modo edición o resetea para modo creación
  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setFormData({
          categoria: itemToEdit.categoria || '',
          proveedor_id: itemToEdit.proveedor_id || '',
          aplicacion_id: itemToEdit.aplicacion_id || '',
          detalles: itemToEdit.detalles || {}
        });
      } else {
        setFormData(initialState);
      }
    }
  }, [itemToEdit, isOpen]);
  
  // Filtra la lista de aplicaciones basándose en el proveedor seleccionado.
  const aplicacionesFiltradas = useMemo(() => {
    if (!formData.proveedor_id) {
      return []; // Si no hay proveedor, no hay aplicaciones para mostrar
    }
    return aplicaciones.filter(app => String(app.proveedor_id) === String(formData.proveedor_id));
  }, [formData.proveedor_id, aplicaciones]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Si se cambia el proveedor, reseteamos la aplicación seleccionada para evitar inconsistencias.
    if (name === 'proveedor_id') {
      setFormData(prev => ({ ...prev, proveedor_id: value, aplicacion_id: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDetallesChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      detalles: {
        ...prev.detalles,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // El modal es inteligente: sabe si es para un centro o una sede
    const dataToSend = { ...formData, centro_id: centroId, sede_id: sedeId };

    const actionPromise = itemToEdit
      ? (centroId ? apiService.updateProveedorInCentro(itemToEdit.id, dataToSend, token) : apiService.updateProveedorInSede(itemToEdit.id, dataToSend, token))
      : (centroId ? apiService.addProveedorToCentro(dataToSend, token) : apiService.addProveedorToSede(dataToSend, token));
      
    toast.promise(actionPromise, {
      loading: 'Guardando...',
      success: () => {
        onSuccess(); // Llama a la función para recargar los datos
        return `¡Guardado con éxito!`;
      },
      error: (err) => err.response?.data?.message || 'Error al guardar.',
    }).finally(() => setLoading(false));
  };
  
  const inputStyle = "w-full rounded-lg border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition";
  const labelStyle = "mb-1 block text-sm font-semibold text-slate-600";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="text-2xl font-semibold text-secondary">{itemToEdit ? 'Editar' : 'Añadir'} Proveedor/Servicio</h3>
          <button onClick={onClose} className="text-3xl font-light text-gray-400 hover:text-gray-800">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-4 max-h-[70vh] overflow-y-auto pr-2 space-y-4">
          <div>
            <label className={labelStyle}>Categoría</label>
            <select name="categoria" value={formData.categoria} onChange={handleInputChange} className={inputStyle} required>
              <option value="">-- Selecciona una categoría --</option>
              {Object.keys(CATEGORIAS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {formData.categoria && (
            <>
              <div>
                <label className={labelStyle}>Proveedor</label>
                <select name="proveedor_id" value={formData.proveedor_id || ''} onChange={handleInputChange} className={inputStyle}>
                  <option value="">-- Selecciona un proveedor --</option>
                  {proveedores.map(prov => <option key={prov.id} value={prov.id}>{prov.nombre_proveedor}</option>)}
                </select>
              </div>
              
              {aplicacionesFiltradas.length > 0 && (
                <div>
                  <label className={labelStyle}>Aplicación (Opcional)</label>
                  <select name="aplicacion_id" value={formData.aplicacion_id || ''} onChange={handleInputChange} className={inputStyle}>
                    <option value="">-- Selecciona una aplicación --</option>
                    {aplicacionesFiltradas.map(app => <option key={app.id} value={app.id}>{app.nombre_aplicacion}</option>)}
                  </select>
                </div>
              )}

              {/* Renderizado de campos dinámicos */}
              {CATEGORIAS[formData.categoria]?.map(field => (
                <div key={field.name}>
                  <label className={labelStyle}>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea name={field.name} value={formData.detalles[field.name] || ''} onChange={handleDetallesChange} className={inputStyle} rows="3"></textarea>
                  ) : (
                    <input type="text" name={field.name} value={formData.detalles[field.name] || ''} onChange={handleDetallesChange} className={inputStyle} />
                  )}
                </div>
              ))}
            </>
          )}

          <div className="flex justify-end gap-4 border-t border-slate-200 pt-4 mt-6">
            <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-5 py-2 font-bold text-slate-700">Cancelar</button>
            <button type="submit" className="rounded-full bg-primary px-5 py-2 font-bold text-white" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProveedorModal;