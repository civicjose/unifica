import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';

const initialState = {
  nombre_completo: '',
  email: '',
  password: '',
  rol_id: '3',
};

function AddUserModal({ isOpen, onClose, onUserAdded }) {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiService.createUser(formData, token);
      toast.success('¡Usuario creado con éxito!');
      setFormData(initialState);
      onUserAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear el usuario.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputStyle = "w-full rounded-lg border-slate-300 bg-slate-100 px-4 py-2.5 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="text-2xl font-semibold text-secondary">Añadir Nuevo Usuario</h3>
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
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-600">Contraseña</label>
              <input type="password" id="password" value={formData.password} onChange={handleChange} className={inputStyle} required />
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
              {loading ? 'Guardando...' : 'Guardar Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUserModal;