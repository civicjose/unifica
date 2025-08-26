import React, { useState, useEffect } from 'react';

function AplicacionModal({ isOpen, onClose, onSubmit, itemToEdit }) {
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Si estamos editando, carga el nombre existente. Si no, lo deja vacío.
      setNombre(itemToEdit ? itemToEdit.nombre_aplicacion : '');
    }
  }, [itemToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ nombre_aplicacion: nombre }); // Llama a la función del padre con los datos
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60">
      <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-2xl">
        <h3 className="text-2xl font-bold text-secondary mb-4">
          {itemToEdit ? 'Editar' : 'Nueva'} Aplicación
        </h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-600">Nombre de la Aplicación</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-lg border-slate-300 bg-slate-100 px-3 py-2"
              required
            />
          </div>
          <div className="flex justify-end gap-4 pt-4 mt-4 border-t">
            <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-5 py-2 font-bold">Cancelar</button>
            <button type="submit" className="rounded-full bg-primary px-5 py-2 font-bold text-white">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AplicacionModal;