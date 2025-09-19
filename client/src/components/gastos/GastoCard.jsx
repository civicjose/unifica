import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiFileText, FiEdit2, FiTrash2, FiRepeat, FiTag, FiUser } from 'react-icons/fi';

function GastoCard({ gasto, onEdit, onDelete }) {
  const { user } = useAuth();

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(number);

  const paymentTypeInfo = {
    'Único': { icon: <FiTag className="h-4 w-4" />, color: 'text-slate-500' },
    'Mensual': { icon: <FiRepeat className="h-4 w-4" />, color: 'text-blue-500' },
    'Trimestral': { icon: <FiRepeat className="h-4 w-4" />, color: 'text-teal-500' },
    'Semestral': { icon: <FiRepeat className="h-4 w-4" />, color: 'text-orange-500' },
    'Anual': { icon: <FiRepeat className="h-4 w-4" />, color: 'text-purple-500' },
  };
  
  const { icon, color } = paymentTypeInfo[gasto.tipo_pago] || paymentTypeInfo['Único'];

  return (
    <div className="flex items-center gap-4 rounded-xl border bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/50">
      
      <div className={`flex flex-col items-center flex-shrink-0 w-16 ${color}`}>
        {icon}
        <span className="text-xs font-semibold mt-1">{gasto.tipo_pago}</span>
      </div>

      <div className="flex-grow min-w-0">
        <p className="font-bold text-secondary truncate">{gasto.concepto}</p>
        {gasto.trabajador_nombre && (
            <p className="flex items-center text-xs font-semibold text-primary mt-1">
                <FiUser className="mr-1.5"/>
                {gasto.trabajador_nombre}
            </p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
          <span>{gasto.nombre_proveedor || 'Sin proveedor'}</span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span>{formatDate(gasto.fecha)}</span>
          {(gasto.tipo_pago !== 'Único' && gasto.fecha_fin_renovacion) && (
            <>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="font-semibold text-red-600">Vence: {formatDate(gasto.fecha_fin_renovacion)}</span>
            </>
          )}
        </div>
      </div>
      
      <div className="flex flex-col items-end flex-shrink-0 ml-4 w-32">
        <p className="font-semibold text-lg text-slate-800 mb-1">{formatCurrency(gasto.importe)}</p>
        <div className="flex items-center gap-1">
          {gasto.factura_url && (
            <a href={gasto.factura_url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-primary rounded-full hover:bg-slate-100" title="Ver factura">
              <FiFileText size={18}/>
            </a>
          )}
          {['Administrador', 'Técnico'].includes(user.rol) && 
            <button onClick={() => onEdit(gasto)} className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-slate-100" title="Editar Gasto">
                <FiEdit2 size={18}/>
            </button>
          }
          {user.rol === 'Administrador' && 
            <button onClick={() => onDelete(gasto)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100" title="Eliminar Gasto">
                <FiTrash2 size={18}/>
            </button>
          }
        </div>
      </div>
    </div>
  );
}

export default GastoCard;