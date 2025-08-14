import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import apiService from '../services/apiService';
import toast from 'react-hot-toast';

// Importa todos los componentes del dashboard
import StatCard from '../components/dashboard/StatCard';
import GlobalSearchWidget from '../components/dashboard/GlobalSearchWidget';
import AlertsWidget from '../components/dashboard/AlertsWidget';
import CompletenessWidget from '../components/dashboard/CompletenessWidget';

import { FiGlobe, FiBriefcase, FiTruck } from 'react-icons/fi';
import { FaUserTie } from 'react-icons/fa';

function DashboardPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        const response = await apiService.getDashboardStats(token);
        setStats(response.data);
      } catch (error) {
        toast.error("No se pudieron cargar los datos del dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return <p className="text-center p-8">Cargando dashboard...</p>;
  }

  const statCards = [
    { title: 'Trabajadores Activos', value: stats?.trabajadoresActivos ?? '0', icon: <FaUserTie className="h-8 w-8" />, color: 'primary', path: '/trabajadores' },
    { title: 'Sedes', value: stats?.totalSedes ?? '0', icon: <FiGlobe className="h-8 w-8" />, color: 'secondary', path: '/sedes' },
    { title: 'Centros', value: stats?.totalCentros ?? '0', icon: <FiBriefcase className="h-8 w-8" />, color: 'accent1', path: '/centros' },
    { title: 'Proveedores', value: stats?.totalProveedores ?? '0', icon: <FiTruck className="h-8 w-8" />, color: 'accent2', path: '/configuracion' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Cabecera */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>
        <p className="text-lg text-gray-600">
          Bienvenido, <span className="font-semibold text-primary">{user.rol}</span>.
        </p>
      </div>

      {/* 2. StatCards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link to={stat.path} key={stat.title}>
            <StatCard icon={stat.icon} title={stat.title} value={stat.value} color={stat.color}/>
          </Link>
        ))}
      </div>

      {/* 3. Búsqueda Global */}
      <div>
        <GlobalSearchWidget />
      </div>

      {/* 4. Sección de Estado del Sistema (dos columnas equilibradas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsWidget alerts={stats?.alertas} />
        <CompletenessWidget data={stats?.completitud} />
      </div>
    </div>
  );
}

export default DashboardPage;