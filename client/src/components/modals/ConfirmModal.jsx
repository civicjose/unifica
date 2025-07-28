import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

function ConfirmModal({ isOpen, onClose, onConfirm, title, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <div className="flex items-start">
          <div className="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
            <FiAlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-grow">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <div className="mt-2 text-sm text-gray-600">
              {children}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-5 py-2 font-bold text-slate-700 transition-colors hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex transform items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2 font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Confirmar Eliminación
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;