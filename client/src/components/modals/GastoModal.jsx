import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';
import Select from 'react-select';
import { FiUploadCloud } from 'react-icons/fi';

const initialState = {
  concepto: '',
  importe: '',
  fecha: new Date().toISOString().split('T')[0],
  proveedor_id: '',
  tipo_pago: 'Único',
  fecha_fin_renovacion: '',
  trabajador_id: '',
};

function GastoModal({ isOpen, onClose, onSuccess, sedeId, centroId, itemToEdit, proveedores, trabajadores }) {
  const [formData, setFormData] = useState(initialState);
  const [facturaFile, setFacturaFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  
  const isEditing = Boolean(itemToEdit);
  const showFechaFin = formData.tipo_pago !== 'Único';

  const trabajadorOptions = useMemo(() => 
    trabajadores.map(t => ({
      value: t.id,
      label: `${t.nombre} ${t.apellidos}`
    })), [trabajadores]);

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setFormData({
          concepto: itemToEdit.concepto || '',
          importe: itemToEdit.importe || '',
          fecha: itemToEdit.fecha || '',
          proveedor_id: itemToEdit.proveedor_id || '',
          tipo_pago: itemToEdit.tipo_pago || 'Único',
          fecha_fin_renovacion: itemToEdit.fecha_fin_renovacion || '',
          trabajador_id: itemToEdit.trabajador_id || '',
        });
      } else {
        setFormData(initialState);
      }
      setFacturaFile(null);
    }
  }, [isOpen, itemToEdit, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    if (name === 'tipo_pago' && value === 'Único') {
        newFormData.fecha_fin_renovacion = '';
    }
    setFormData(newFormData);
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData({ ...formData, [name]: selectedOption ? selectedOption.value : '' });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFacturaFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const dataToSend = new FormData();
    for (const key in formData) {
      dataToSend.append(key, formData[key] || '');
    }
    if (sedeId) dataToSend.append('sede_id', sedeId);
    if (centroId) dataToSend.append('centro_id', centroId);
    if (facturaFile) dataToSend.append('factura', facturaFile);

    const actionPromise = isEditing
        ? apiService.updateGasto(itemToEdit.id, dataToSend, token)
        : apiService.createGasto(dataToSend, token);

    toast.promise(actionPromise, {
        loading: 'Guardando...',
        success: () => {
          onSuccess();
          return `¡Gasto ${isEditing ? 'actualizado' : 'guardado'} con éxito!`;
        },
        error: (err) => err.response?.data?.message || `Error al ${isEditing ? 'actualizar' : 'guardar'}.`,
      }
    ).finally(() => setLoading(false));
  };

  if (!isOpen) return null;
  
  const inputStyle = "w-full rounded-lg border-slate-300 bg-slate-100 px-4 py-2.5 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition";
  const labelStyle = "mb-1 block text-sm font-semibold text-slate-600";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="text-2xl font-semibold text-secondary">{isEditing ? 'Editar' : 'Añadir'} Gasto</h3>
          <button onClick={onClose} className="text-3xl font-light text-gray-400">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelStyle}>Concepto</label>
              <input type="text" name="concepto" value={formData.concepto} onChange={handleChange} className={inputStyle} required />
            </div>
            <div>
              <label className={labelStyle}>Proveedor (Opcional)</label>
              <select name="proveedor_id" value={formData.proveedor_id} onChange={handleChange} className={inputStyle}>
                <option value="">-- Seleccionar Proveedor --</option>
                {proveedores.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre_proveedor}</option>
                ))}
              </select>
            </div>
             <div>
              <label className={labelStyle}>Importe (€)</label>
              <input type="number" name="importe" step="0.01" value={formData.importe} onChange={handleChange} className={inputStyle} required />
            </div>
            <div>
              <label className={labelStyle}>Tipo de Pago</label>
              <select name="tipo_pago" value={formData.tipo_pago} onChange={handleChange} className={inputStyle}>
                <option value="Único">Único</option>
                <option value="Mensual">Mensual</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}>Fecha del Gasto / Inicio</label>
              <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} className={inputStyle} required />
            </div>
            {showFechaFin && (
                 <div>
                    <label className={labelStyle}>Fecha Fin o Renovación</label>
                    <input type="date" name="fecha_fin_renovacion" value={formData.fecha_fin_renovacion || ''} onChange={handleChange} className={inputStyle} />
                </div>
            )}
            <div className="md:col-span-2">
              <label className={labelStyle}>Asignar a Trabajador (Opcional)</label>
              <Select
                options={trabajadorOptions}
                isClearable
                isSearchable
                placeholder="Busca un trabajador..."
                value={trabajadorOptions.find(opt => opt.value === formData.trabajador_id)}
                onChange={selectedOption => handleSelectChange('trabajador_id', selectedOption)}
              />
          </div>
          </div>

          <div>
            <label className={labelStyle}>Adjuntar Factura (PDF)</label>
            <label className="flex flex-col w-full h-24 border-2 border-dashed border-gray-300 hover:bg-gray-100 hover:border-primary rounded-lg cursor-pointer">
              <div className="flex flex-col items-center justify-center pt-5">
                <FiUploadCloud className="w-8 h-8 text-primary" />
                <p className="pt-1 text-sm tracking-wider text-slate-500">
                  {facturaFile ? facturaFile.name : (isEditing && itemToEdit.factura_url ? 'Reemplazar factura existente' : 'Selecciona un archivo')}
                </p>
              </div>
              <input type="file" onChange={handleFileChange} className="opacity-0" accept=".pdf" />
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-5 py-2 font-bold">Cancelar</button>
            <button type="submit" className="rounded-full bg-primary px-5 py-2 font-bold text-white" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GastoModal;