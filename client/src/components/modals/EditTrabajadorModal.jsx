import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import trabajadoresService from '../../services/trabajadoresService';
import { useAuth } from '../../context/AuthContext';

function EditTrabajadorModal({ isOpen, onClose, onTrabajadorUpdated, trabajador }) {
  const [formData, setFormData] = useState({});
  const [listas, setListas] = useState({ puestos: [], sedes: [], centros: [] });
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    // Carga las listas para los desplegables
    if (isOpen && token) {
      Promise.all([
        trabajadoresService.getPuestos(token),
        trabajadoresService.getSedes(token),
        trabajadoresService.getCentros(token),
      ]).then(([puestosRes, sedesRes, centrosRes]) => {
        setListas({
          puestos: puestosRes.data,
          sedes: sedesRes.data,
          centros: centrosRes.data,
        });
      }).catch(() => toast.error("No se pudieron cargar las listas para los selectores."));
    }

    // Rellena el formulario con los datos del trabajador a editar
    if (trabajador) {
      setFormData({
        nombre: trabajador.nombre || '',
        apellidos: trabajador.apellidos || '',
        email: trabajador.email || '',
        telefono: trabajador.telefono || '',
        puesto_id: trabajador.puesto_id || '',
        sede_id: trabajador.sede_id || '',
        centro_id: trabajador.centro_id || '',
        estado: trabajador.estado || 'Alta',
        fecha_alta: trabajador.fecha_alta?.split('T')[0] || '',
        fecha_baja: trabajador.fecha_baja?.split('T')[0] || null,
      });
    }
  }, [isOpen, token, trabajador]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await trabajadoresService.updateTrabajador(trabajador.id, formData, token);
      toast.success('Trabajador actualizado con éxito.');
      onTrabajadorUpdated();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar el trabajador.');
    } finally {
      setLoading(false);
    }
  };
  
  const inputStyle = "w-full rounded-lg border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition";
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="text-2xl font-semibold text-secondary">Editar Trabajador</h3>
          <button onClick={onClose} className="text-3xl font-light text-gray-400 hover:text-gray-800">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Nombre</label>
              <input name="nombre" value={formData.nombre} onChange={handleChange} className={inputStyle} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Apellidos</label>
              <input name="apellidos" value={formData.apellidos} onChange={handleChange} className={inputStyle} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Teléfono</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Puesto</label>
              <select name="puesto_id" value={formData.puesto_id} onChange={handleChange} className={inputStyle}>
                  <option value="">-- Seleccionar Puesto --</option>
                  {listas.puestos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Sede (Oficina)</label>
              <select name="sede_id" value={formData.sede_id} onChange={handleChange} className={inputStyle}>
                  <option value="">-- Seleccionar Sede --</option>
                  {listas.sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Centro de Servicio</label>
              <select name="centro_id" value={formData.centro_id} onChange={handleChange} className={inputStyle}>
                  <option value="">-- Seleccionar Centro --</option>
                  {listas.centros.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Estado</label>
              <select name="estado" value={formData.estado} onChange={handleChange} className={inputStyle}>
                  <option value="Alta">Alta</option>
                  <option value="Baja">Baja</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Fecha de Alta</label>
              <input type="date" name="fecha_alta" value={formData.fecha_alta} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Fecha de Baja</label>
              <input type="date" name="fecha_baja" value={formData.fecha_baja || ''} onChange={handleChange} className={inputStyle} />
            </div>
          </div>
          <div className="flex justify-end gap-4 border-t border-slate-200 pt-4 mt-6">
            <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-5 py-2 font-bold text-slate-700 transition-colors hover:bg-slate-200">
              Cancelar
            </button>
            <button type="submit" className="flex transform items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-purple-600 px-5 py-2 font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50" disabled={loading}>
              {loading ? 'Actualizando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTrabajadorModal;