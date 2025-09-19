import React, { useMemo } from 'react';
import { FiX, FiShoppingCart } from 'react-icons/fi';

function GastosTrabajadorModal({ isOpen, onClose, gastos, trabajadorNombre }) {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(number);

  // Usamos useMemo para calcular el total solo cuando la lista de gastos cambie.
  const totalGastos = useMemo(() => {
    return gastos.reduce((sum, gasto) => sum + parseFloat(gasto.importe), 0);
  }, [gastos]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl flex flex-col">
        <div className="flex items-start justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-2xl font-semibold text-secondary flex items-center">
              <FiShoppingCart className="mr-3"/>
              Historial de Gastos
            </h3>
            <p className="text-slate-500 mt-1">{trabajadorNombre}</p>
          </div>
          <button onClick={onClose} className="text-3xl font-light text-gray-400 hover:text-gray-800">&times;</button>
        </div>
        
        <div className="mt-4 max-h-[55vh] overflow-y-auto pr-2">
          {gastos.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No hay gastos para mostrar.</p>
          ) : (
            <ul className="space-y-3">
              {gastos.map(gasto => (
                <li key={gasto.id} className="flex justify-between items-center rounded-lg bg-slate-50 p-3">
                  <div>
                    <p className="font-semibold text-slate-800">{gasto.concepto}</p>
                    <p className="text-xs text-slate-500">{formatDate(gasto.fecha)} en {gasto.ubicacion_gasto}</p>
                  </div>
                  <p className="font-bold text-secondary flex-shrink-0 ml-4">{formatCurrency(gasto.importe)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end items-center">
            <span className="text-lg font-bold text-secondary">TOTAL:</span>
            <span className="text-xl font-bold text-secondary ml-4">{formatCurrency(totalGastos)}</span>
        </div>
      </div>
    </div>
  );
}

export default GastosTrabajadorModal;