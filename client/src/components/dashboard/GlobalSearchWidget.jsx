import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';
import { FiSearch, FiUser, FiHome, FiArchive } from 'react-icons/fi';

function GlobalSearchWidget() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (searchTerm.length < 3) {
      setResults(null);
      return;
    }

    setLoading(true);
    const debounce = setTimeout(() => {
      apiService.globalSearch(searchTerm, token)
        .then(res => setResults(res.data))
        .catch(() => toast.error('Error en la búsqueda.'))
        .finally(() => setLoading(false));
    }, 500); // Pequeño delay para no buscar en cada pulsación

    return () => clearTimeout(debounce);
  }, [searchTerm, token]);

  const renderResult = (item, type) => {
    const icons = {
      trabajadores: <FiUser className="text-blue-500" />,
      centros: <FiHome className="text-green-500" />,
      sedes: <FiArchive className="text-purple-500" />,
    };
    const paths = {
      trabajadores: '/trabajadores', // En el futuro podría ir a la ficha
      centros: `/centros/${item.id}`,
      sedes: `/sedes/${item.id}`,
    };
    const name = item.nombre_centro || item.nombre_sede || `${item.nombre} ${item.apellidos}`;

    return (
      <li key={`${type}-${item.id}`}>
        <Link to={paths[type]} className="flex items-center p-2 rounded-md hover:bg-slate-100">
          {icons[type]}
          <span className="ml-3">{name}</span>
        </Link>
      </li>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h3 className="text-lg font-bold text-secondary mb-4">Búsqueda Rápida</h3>
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar trabajadores, centros o sedes..."
          className="w-full rounded-full border bg-slate-50 py-3 pl-12 pr-4 text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-6 w-6" />
      </div>

      {results && (
        <div className="mt-4">
          {loading && <p>Buscando...</p>}
          {!loading && Object.values(results).every(arr => arr.length === 0) && <p>No se encontraron resultados.</p>}
          
          {results.trabajadores?.length > 0 && <ul className="space-y-1">{results.trabajadores.map(item => renderResult(item, 'trabajadores'))}</ul>}
          {results.centros?.length > 0 && <ul className="space-y-1 mt-2">{results.centros.map(item => renderResult(item, 'centros'))}</ul>}
          {results.sedes?.length > 0 && <ul className="space-y-1 mt-2">{results.sedes.map(item => renderResult(item, 'sedes'))}</ul>}
        </div>
      )}
    </div>
  );
}

export default GlobalSearchWidget;