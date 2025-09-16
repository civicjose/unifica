import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';

function EditUserModal({ isOpen, onClose, onUserUpdated, user }) {
  const [formData, setFormData] = useState({ nombre_completo: '', email: '', rol_id: '' });
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (user) {
      setFormData({
        nombre_completo: user.nombre_completo || '',
        email: user.email || '',
        rol_id: user.rol_id || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.updateUser(user.id, formData, token);
      toast.success('¡Usuario actualizado con éxito!');
      onUserUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full rounded-lg border-slate-300 bg-slate-100 px-4 py-2.5 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition";
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="text-2xl font-semibold text-secondary">Editar Usuario</h3>
          <button onClick={onClose} className="text-3xl font-light text-gray-400 hover:text-gray-800">&times;</button>
        </div>

        <form className="mt-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="nombre_completo" className="mb-1 block text-sm font-medium text-slate-600">Nombre Completo</label>
              <input type="text" id="nombre_completo" value={formData.nombre_completo} onChange={handleChange} className={inputStyle} required />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-600">Correo Electrónico</label>
              <input type="email" id="email" value={formData.email} onChange={handleChange} className={inputStyle} required />
            </div>
            <div>
              <label htmlFor="rol_id" className="mb-1 block text-sm font-medium text-slate-600">Rol</label>
              <select id="rol_id" value={formData.rol_id} onChange={handleChange} className={inputStyle}>
                <option value="1">Administrador</option>
                <option value="2">Técnico</option>
                <option value="3">Usuario</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 border-t border-slate-200 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-slate-100 px-5 py-2 font-bold text-slate-700 transition-colors hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex transform items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-purple-600 px-5 py-2 font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserModal;