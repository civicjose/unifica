import React, { useState } from 'react';
import toast from 'react-hot-toast';
import trabajadoresService from '../../services/trabajadoresService';
import { useAuth } from '../../context/AuthContext';
import { FiUploadCloud } from 'react-icons/fi';

function ImportTrabajadoresModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Por favor, selecciona un archivo CSV.');
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Importando trabajadores...');
    try {
      const response = await trabajadoresService.importTrabajadores(file, token);
      toast.success(response.data.message, { id: toastId });
      onImportSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error en la importación.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="text-2xl font-semibold text-secondary">Importación Masiva</h3>
          <button onClick={onClose} className="text-3xl font-light text-gray-400 hover:text-gray-800">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4">
          <p className="text-slate-600 mb-4">
            Selecciona un archivo CSV con codificación UTF-8. Asegúrate de que las columnas coinciden con la plantilla.
          </p>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col w-full h-32 border-4 border-dashed border-gray-200 hover:bg-gray-100 hover:border-primary rounded-lg cursor-pointer">
              <div className="flex flex-col items-center justify-center pt-7">
                <FiUploadCloud className="w-10 h-10 text-primary" />
                <p className="pt-1 text-sm tracking-wider text-slate-500">
                  {file ? file.name : 'Selecciona un archivo'}
                </p>
              </div>
              <input type="file" onChange={handleFileChange} className="opacity-0" accept=".csv" />
            </label>
          </div>
          <div className="flex justify-end gap-4 border-t border-slate-200 pt-4 mt-6">
            <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-5 py-2 font-bold text-slate-700 hover:bg-slate-200">
              Cancelar
            </button>
            <button type="submit" className="flex transform items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-purple-600 px-5 py-2 font-bold text-white shadow-md" disabled={loading}>
              {loading ? 'Importando...' : 'Iniciar Importación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ImportTrabajadoresModal;