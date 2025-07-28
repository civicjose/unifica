// src/pages/DashboardPage.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import StatCard from '../components/dashboard/StatCard';
import { FiUsers, FiGlobe, FiServer, FiHardDrive, FiUserPlus } from 'react-icons/fi';

// Datos de ejemplo que luego vendrán de la API
const stats = [
  { title: 'Sedes', value: '12', icon: <FiGlobe className="h-8 w-8" />, color: 'primary' },
  { title: 'Servicios', value: '54', icon: <FiServer className="h-8 w-8" />, color: 'secondary' },
  { title: 'Usuarios', value: '87', icon: <FiUsers className="h-8 w-8" />, color: 'accent1' },
  { title: 'Aplicaciones', value: '23', icon: <FiHardDrive className="h-8 w-8" />, color: 'accent2' },
];

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Sección de Bienvenida */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          ¡Bienvenido de nuevo!
        </h1>
        <p className="text-lg text-gray-600">
          Sesión iniciada como: <span className="font-semibold text-primary">{user.rol}</span>
        </p>
      </div>

      {/* Sección de Estadísticas (KPIs) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            color={stat.color}
          />
        ))}
      </div>

      {/* Sección de Accesos Rápidos */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Tarjeta de acceso rápido */}
          {user.rol === 'Administrador' && (
            <Link to="/users" className="transform rounded-lg bg-white p-6 text-center shadow transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <FiUserPlus className="mx-auto h-12 w-12 text-primary" />
              <p className="mt-4 text-xl font-semibold text-gray-700">Gestionar Usuarios</p>
            </Link>
          )}

          <Link to="/sedes" className="transform rounded-lg bg-white p-6 text-center shadow transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <FiGlobe className="mx-auto h-12 w-12 text-secondary" />
            <p className="mt-4 text-xl font-semibold text-gray-700">Ver Sedes</p>
          </Link>
          
          {/* Aquí podrías añadir más accesos directos */}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;