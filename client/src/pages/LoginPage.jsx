// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(formData.email, formData.password);
      login(data.token);
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al iniciar sesión';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary to-secondary">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="font-poppins text-5xl font-bold bg-gradient-to-r from-primary to-accent-2 bg-clip-text text-transparent">
            Unifica
          </h1>
          <p className="font-poppins text-sm text-gray-500">by Macrosad</p>
        </div>
        <h2 className="mb-6 text-center text-2xl font-bold text-secondary">Inicio de sesión</h2>
        
        {/* 5. Conectamos el formulario al estado y las funciones */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input
              type="email"
              id="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              id="password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Mostramos el mensaje de error si existe */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-center text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full rounded-md bg-primary px-4 py-2 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
              disabled={loading} // Desactivamos el botón mientras carga
            >
              {loading ? 'Accediendo...' : 'Acceder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;