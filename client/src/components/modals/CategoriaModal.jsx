import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

// Función para generar un ID limpio a partir de una etiqueta
const generateFieldName = (label) => {
  return label
    .toLowerCase()
    .normalize("NFD") // Separa los acentos de las letras
    .replace(/[\u0300-\u036f]/g, "") // Elimina los acentos
    .replace(/\s+/g, '_') // Reemplaza espacios con guiones bajos
    .replace(/[^a-z0-9_]/g, ''); // Elimina cualquier caracter no alfanumérico
};

function CategoriaModal({ isOpen, onClose, onSubmit, itemToEdit }) {
  const [nombre, setNombre] = useState('');
  const [campos, setCampos] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setNombre(itemToEdit?.nombre_categoria || '');
      setCampos(itemToEdit?.campos_formulario || []);
    }
  }, [itemToEdit, isOpen]);

  const handleCampoChange = (index, event) => {
    const newCampos = [...campos];
    const newLabel = event.target.value;
    newCampos[index].label = newLabel;
    // Generamos el 'name' (ID) automáticamente a partir de la etiqueta
    newCampos[index].name = generateFieldName(newLabel);
    setCampos(newCampos);
  };

  const handleTypeChange = (index, event) => {
    const newCampos = [...campos];
    newCampos[index].type = event.target.value;
    setCampos(newCampos);
  };

  const addCampo = () => {
    setCampos([...campos, { name: '', label: '', type: 'text' }]);
  };

  const removeCampo = (index) => {
    const newCampos = campos.filter((_, i) => i !== index);
    setCampos(newCampos);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filtramos campos que puedan estar vacíos antes de enviar
    const camposValidos = campos.filter(c => c.label.trim() !== '');
    onSubmit({ nombre_categoria: nombre, campos_formulario: camposValidos });
  };

  if (!isOpen) return null;

  // --- ESTILO CORREGIDO Y UNIFICADO ---
  const inputStyle = "w-full mt-1 rounded-lg border-slate-300 bg-slate-100 px-4 py-2.5 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-2xl">
        <h3 className="text-2xl font-bold text-secondary mb-4">{itemToEdit ? 'Editar' : 'Nueva'} Categoría</h3>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="font-semibold text-slate-600">Nombre de la Categoría</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              className={inputStyle} 
              required 
            />
          </div>

          <div>
            <h4 className="font-semibold text-slate-600">Campos Personalizados del Formulario</h4>
            <div className="space-y-3 mt-2">
              {campos.map((campo, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="flex-grow w-full">
                      <label className="text-sm font-medium text-slate-600">Etiqueta del Campo</label>
                      <input 
                        type="text" 
                        value={campo.label} 
                        onChange={(e) => handleCampoChange(index, e)} 
                        placeholder="Ej: Línea Contratada" 
                        className={inputStyle}
                        required 
                      />
                    </div>
                    <div className="w-full sm:w-1/4">
                       <label className="text-sm font-medium text-slate-600">Tipo</label>
                       <select value={campo.type} onChange={(e) => handleTypeChange(index, e)} className={inputStyle}>
                         <option value="text">Texto</option>
                         <option value="textarea">Área de Texto</option>
                       </select>
                    </div>
                    <button type="button" onClick={() => removeCampo(index)} className="p-2 text-red-500 self-end mb-1"><FiTrash2 /></button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    ID del campo: <code className="bg-slate-200 px-1 rounded">{campo.name}</code>
                  </p>
                </div>
              ))}
              <button type="button" onClick={addCampo} className="flex items-center gap-2 text-sm font-semibold text-primary">
                <FiPlus /> Añadir Campo
              </button>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-5 py-2 font-bold text-slate-700">Cancelar</button>
            <button type="submit" className="rounded-full bg-primary px-5 py-2 font-bold text-white">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoriaModal;