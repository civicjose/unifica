import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';
import { FiExternalLink } from 'react-icons/fi';

function ProveedorVinculos({ proveedorId }) {
  const [vinculos, setVinculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const loadVinculos = useCallback(async () => {
    if (!token || !proveedorId) return;
    setLoading(true);
    try {
      const res = await apiService.getVinculosByProvider(proveedorId, token);
      setVinculos(res.data);
    } catch (error) {
      toast.error('No se pudieron cargar los vínculos del proveedor.');
    } finally {
      setLoading(false);
    }
  }, [proveedorId, token]);

  useEffect(() => {
    loadVinculos();
  }, [loadVinculos]);

  if (loading) {
    return <p className="text-center p-4">Cargando vinculaciones...</p>;
  }

  if (vinculos.length === 0) {
    return <p className="text-center text-slate-500 p-4">Este proveedor no está vinculado a ninguna Sede o Centro.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Ubicación</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Tipo</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Categoría del Servicio</th>
            <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">Acción</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {vinculos.map(v => (
            <tr key={`${v.tipo}-${v.id}`}>
              <td className="px-4 py-3 font-semibold text-secondary">{v.nombre}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs rounded-full font-semibold ${v.tipo === 'Sede' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                  {v.tipo}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">{v.categoria}</td>
              <td className="px-4 py-3 text-right">
                <Link to={`/${v.tipo.toLowerCase()}s/${v.id}`} className="inline-flex items-center gap-2 text-primary hover:underline" title={`Ir a la ficha de ${v.tipo}`}>
                  Ver Ficha <FiExternalLink />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProveedorVinculos;