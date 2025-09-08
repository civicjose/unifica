import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiEdit } from 'react-icons/fi';
import ProveedorContactos from '../components/proveedores/ProveedorContactos';
import ProveedorAplicaciones from '../components/proveedores/ProveedorAplicaciones';
import ProveedorVinculos from '../components/proveedores/ProveedorVinculos';
import ProveedorModal from '../components/modals/ProveedorModal';

const InfoBlock = ({ title, children, onEdit }) => (
    <div className="bg-white p-6 rounded-xl border shadow-sm h-full">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h3 className="text-lg font-bold text-secondary">{title}</h3>
            {/* --- CONTROL DE ROL: El botón de editar solo se muestra si onEdit existe --- */}
            {onEdit && <button onClick={onEdit} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Editar Información"><FiEdit /></button>}
        </div>
        <div className="space-y-4">{children}</div>
    </div>
);

const DetailRow = ({ label, children }) => (
    <div>
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <div className="text-slate-800 whitespace-pre-wrap mt-1 break-words">{children || '-'}</div>
    </div>
);

function ProveedorDetailPage() {
  const { id } = useParams();
  const { token, user } = useAuth(); // Obtenemos el usuario
  const [proveedor, setProveedor] = useState(null);
  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contactos');
  const [isProveedorModalOpen, setIsProveedorModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const [proveedorRes, contactosRes] = await Promise.all([
        apiService.getProveedorById(id, token),
        apiService.getContactsByProvider(id, token)
      ]);
      setProveedor(proveedorRes.data);
      setContactos(contactosRes.data);
    } catch (error) {
      toast.error('No se pudo cargar la información del proveedor.');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleUpdateProveedor = (formData) => {
    toast.promise(apiService.updateProveedor(id, formData, token), {
      loading: 'Guardando...',
      success: () => { setIsProveedorModalOpen(false); loadData(); return '¡Guardado!'; },
      error: 'Error al guardar.',
    });
  };
  
  const renderTabContent = () => {
    if (!proveedor) return null;
    switch (activeTab) {
      case 'contactos':
        return <ProveedorContactos proveedorId={proveedor.id} contactos={contactos} onUpdate={loadData} />;
      case 'aplicaciones':
        return <ProveedorAplicaciones proveedor={proveedor} contactos={contactos} />;
      case 'vinculos':
        return <ProveedorVinculos proveedorId={proveedor.id} />;
      default:
        return null;
    }
  };

  if (loading) return <p className="text-center p-8">Cargando proveedor...</p>;
  if (!proveedor) return <p className="text-center p-8">No se encontró el proveedor.</p>;
  
  const tabStyle = "px-4 py-2 font-semibold transition-colors rounded-t-lg";
  const activeTabStyle = "bg-white text-primary";
  const inactiveTabStyle = "bg-transparent text-slate-500 hover:bg-slate-100";

  return (
    <>
      <div className="space-y-6">
        <Link to="/proveedores" className="flex items-center gap-2 text-primary font-semibold hover:underline"><FiArrowLeft /> Volver</Link>
        <h1 className="text-4xl font-bold text-gray-800">{proveedor.nombre_proveedor}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <InfoBlock 
              title="Información General" 
              onEdit={['Administrador', 'Técnico'].includes(user.rol) ? () => setIsProveedorModalOpen(true) : null}
            >
              <DetailRow label="Página Web"><a href={proveedor.url_proveedor} target="_blank" rel="noopener noreferrer" className="text-blue-600">{proveedor.url_proveedor}</a></DetailRow>
              <DetailRow label="Teléfono">{proveedor.telefono}</DetailRow>
              <DetailRow label="Email">{proveedor.email}</DetailRow>
              {proveedor.observaciones && <DetailRow label="Observaciones">{proveedor.observaciones}</DetailRow>}
            </InfoBlock>
          </div>
          <div className="md:col-span-2">
            <div className="border-b border-slate-300">
              <nav className="flex space-x-2">
                <button onClick={() => setActiveTab('contactos')} className={`${tabStyle} ${activeTab === 'contactos' ? activeTabStyle : inactiveTabStyle}`}>Contactos</button>
                <button onClick={() => setActiveTab('aplicaciones')} className={`${tabStyle} ${activeTab === 'aplicaciones' ? activeTabStyle : inactiveTabStyle}`}>Aplicaciones</button>
                <button onClick={() => setActiveTab('vinculos')} className={`${tabStyle} ${activeTab === 'vinculos' ? activeTabStyle : inactiveTabStyle}`}>Vinculado en</button>
              </nav>
            </div>
            <div className="mt-4 bg-white p-6 rounded-xl border shadow-sm min-h-[300px]">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
      <ProveedorModal isOpen={isProveedorModalOpen} onClose={() => setIsProveedorModalOpen(false)} onSubmit={handleUpdateProveedor} itemToEdit={proveedor} />
    </>
  );
}

export default ProveedorDetailPage;