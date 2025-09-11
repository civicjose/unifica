import React, { useState, useMemo } from 'react';
import { FiSearch } from 'react-icons/fi';

const getInitials = (name = '') => {
  if (!name) return '';
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  const lastNameInitial = names[names.length - 1] ? names[names.length - 1].charAt(0) : '';
  return (names[0].charAt(0) + lastNameInitial).toUpperCase();
};

function TrabajadoresList({ trabajadores, onWorkerClick }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTrabajadores = useMemo(() => {
    if (!searchTerm) {
      return trabajadores;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return trabajadores.filter(t => 
      `${t.nombre} ${t.apellidos}`.toLowerCase().includes(lowerCaseSearch) ||
      t.puesto.toLowerCase().includes(lowerCaseSearch)
    );
  }, [trabajadores, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <input 
          type="text"
          placeholder="Buscar en la plantilla..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-full border bg-slate-100 py-2 pl-10 pr-4"
        />
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>

      {filteredTrabajadores.length === 0 ? (
        <p className="text-center text-slate-500 py-8">
          {trabajadores.length > 0 ? 'No se encontraron trabajadores con ese nombre.' : 'No hay trabajadores asignados a esta ubicación.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
          {filteredTrabajadores.map(trabajador => (
            <button
              key={trabajador.id}
              onClick={() => onWorkerClick(trabajador)}
              className="flex w-full items-center p-3 rounded-lg transition-colors hover:bg-slate-100 text-left"
            >
              <div className="mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-white">
                {getInitials(`${trabajador.nombre} ${trabajador.apellidos}`)}
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-slate-800 truncate">{trabajador.nombre} {trabajador.apellidos}</p>
                <p className="text-sm text-slate-500 truncate">{trabajador.puesto}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrabajadoresList;