import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import toast from 'react-hot-toast';

// Importa los componentes del dashboard
import StatCard from '../components/dashboard/StatCard';
import GlobalSearchWidget from '../components/dashboard/GlobalSearchWidget';
import DashboardChartWidget from '../components/dashboard/DashboardChartWidget';
import ActivityWidget from '../components/dashboard/ActivityWidget';
import MapWidget from '../components/dashboard/MapWidget';

import { FiGlobe, FiBriefcase, FiTruck, FiUsers, FiPlusCircle, FiEye } from 'react-icons/fi';
import { FaUserTie } from 'react-icons/fa';

function DashboardPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
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

  const handleQuickAction = (action) => {
    navigate(action.path, { state: { openAddModal: true } });
  };

  if (loading) {
    return <p className="text-center p-8">Cargando dashboard...</p>;
  }

  const statCards = [
    { title: 'Trabajadores Activos', value: stats?.trabajadoresActivos ?? '0', icon: <FaUserTie className="h-8 w-8" />, color: 'primary', path: '/trabajadores' },
    { title: 'Sedes', value: stats?.totalSedes ?? '0', icon: <FiGlobe className="h-8 w-8" />, color: 'secondary', path: '/sedes' },
    { title: 'Centros', value: stats?.totalCentros ?? '0', icon: <FiBriefcase className="h-8 w-8" />, color: 'accent1', path: '/centros' },
    { title: 'Proveedores', value: stats?.totalProveedores ?? '0', icon: <FiTruck className="h-8 w-8" />, color: 'accent2', path: '/proveedores' },
  ];

  const quickActions = [
      { name: 'Añadir Trabajador', path: '/trabajadores' },
      { name: 'Añadir Centro', path: '/centros' },
      { name: 'Añadir Sede', path: '/sedes' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Cabecera */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>
        <p className="text-lg text-gray-600">
          Bienvenido de nuevo, <span className="font-semibold text-primary">{user.rol}</span>.
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
      
      {/* 3. Mapa de Ubicaciones */}
      <div className="grid grid-cols-1">
          <MapWidget locations={stats?.locationsForMap} />
      </div>

      {/* 4. Columnas con Gráficos y Actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <GlobalSearchWidget />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardChartWidget 
              title="Trabajadores por Puesto (Top 5)" 
              data={stats?.graficos?.trabajadoresPorPuesto} 
              icon={<FiUsers className="h-6 w-6 text-secondary" />}
            />
            <DashboardChartWidget 
              title="Centros por Provincia (Top 5)" 
              data={stats?.graficos?.centrosPorProvincia} 
              icon={<FiGlobe className="h-6 w-6 text-secondary" />}
            />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {['Administrador', 'Técnico'].includes(user.rol) ? (
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className="text-lg font-bold text-secondary mb-4">Acciones Rápidas</h3>
                <div className="space-y-3">
                    {quickActions.map(action => (
                        <button 
                            key={action.name} 
                            onClick={() => handleQuickAction(action)} 
                            className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-primary/10 transition-colors"
                        >
                            <FiPlusCircle className="h-5 w-5 text-primary"/>
                            <span className="font-semibold text-slate-700">{action.name}</span>
                        </button>
                    ))}
                </div>
            </div>
          ) : (
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                <div className="flex items-center">
                    <FiEye className="h-6 w-6 text-blue-600 mr-3"/>
                    <h3 className="text-lg font-bold text-blue-800">Modo Consulta</h3>
                </div>
                <p className="text-sm text-blue-700 mt-2">
                    Tu perfil tiene permisos de solo lectura. Puedes navegar y ver toda la información.
                </p>
            </div>
          )}
          <ActivityWidget activities={stats?.actividadReciente} />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;