import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPaperclip, FiDatabase, FiPlus, FiEdit } from 'react-icons/fi';
import ProveedorCard from '../components/centros/ProveedorCard';
import AddProveedorModal from '../components/modals/AddProveedorModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import CentroModal from '../components/modals/CentroModal';
import ContactoDetailModal from '../components/modals/ContactoDetailModal';

const InfoBlock = ({ title, children, onEdit }) => (
  <div className="bg-white p-6 rounded-xl border shadow-sm h-full">
    <div className="flex justify-between items-center border-b pb-2 mb-4">
      <h3 className="text-lg font-bold text-secondary">{title}</h3>
      {onEdit && ( <button onClick={onEdit} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Editar Información"><FiEdit /></button> )}
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

function CentroDetailPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [centro, setCentro] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isProveedorModalOpen, setIsProveedorModalOpen] = useState(false);
  const [isCentroModalOpen, setIsCentroModalOpen] = useState(false);
  const [contactToShow, setContactToShow] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [aplicaciones, setAplicaciones] = useState([]);
  const [listas, setListas] = useState({ territorios: [], tiposCentro: [], categorias: [] });
  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const loadPageData = useCallback(async () => {
    if (token && id) {
      setLoading(true);
      try {
        const [centroRes, provRes, appRes, terrRes, tiposRes, catRes] = await Promise.all([
          apiService.getCentroDetails(id, token),
          apiService.getProveedores(token),
          apiService.getAplicaciones(token),
          apiService.getTerritorios(token),
          apiService.getTiposCentro(token),
          apiService.getCategoriasProveedor(token),
        ]);
        setCentro(centroRes.data);
        setProveedores(provRes.data);
        setAplicaciones(appRes.data);
        setListas({ 
          territorios: terrRes.data, 
          tiposCentro: tiposRes.data,
          categorias: catRes.data
        });
      } catch (error) {
        toast.error('No se pudo cargar la información del centro.');
      } finally {
        setLoading(false);
      }
    }
  }, [id, token]);

  useEffect(() => { loadPageData(); }, [loadPageData]);
  
  const handleOpenAddProveedorModal = () => { setItemToEdit(null); setIsProveedorModalOpen(true); };
  const handleOpenEditProveedorModal = (item) => { setItemToEdit(item); setIsProveedorModalOpen(true); };
  const handleDeleteProveedorClick = (item) => { setItemToDelete(item); };
  const handleContactClick = (contacto) => { setContactToShow(contacto); };
  
  const handleModalSuccess = () => {
    setIsProveedorModalOpen(false);
    setIsCentroModalOpen(false);
    setItemToEdit(null);
    loadPageData();
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    toast.promise(apiService.deleteProveedorFromCentro(itemToDelete.id, token), {
      loading: 'Desvinculando...',
      success: () => { setItemToDelete(null); loadPageData(); return 'Proveedor desvinculado con éxito.'; },
      error: 'Error al desvincular.',
    });
  };

  const createGlpiInventoryLink = (centroName) => {
    const baseUrl = 'https://sistemas.macrosad.com/front/computer.php';
    const params = new URLSearchParams({
      is_deleted: '0', as_map: '0', browse: '0',
      'criteria[0][link]': 'AND', 'criteria[0][field]': '12',
      'criteria[0][searchtype]': 'contains', 'criteria[0][value]': centro.nombre_centro,
      itemtype: 'Computer',
    });
    return `${baseUrl}?${params.toString()}`;
  };

  if (loading) { return <p className="text-center p-8">Cargando datos del centro...</p>; }
  if (!centro) { return <p className="text-center p-8">No se encontró el centro.</p>; }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/centros" className="flex items-center gap-2 text-primary font-semibold hover:underline">
            <FiArrowLeft /> Volver a la lista de centros
          </Link>
          {user.rol === 'Administrador' && (
            <button onClick={() => setIsCentroModalOpen(true)} className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-blue-700">
              <FiEdit /> Editar Centro
            </button>
          )}
        </div>
        <h1 className="text-4xl font-bold text-gray-800">{centro.nombre_centro}</h1>
        
        {/* ***** CORRECCIÓN AQUÍ: Se añade 'md:items-start' ***** */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:items-start">
          <div className="md:col-span-1 space-y-6">
            <InfoBlock title="Información General">
              <DetailRow label="Dirección">{`${centro.direccion || ''}, ${centro.codigo_postal || ''} ${centro.localidad || ''}, ${centro.provincia || ''}`}</DetailRow>
              <DetailRow label="Tipo de Centro">{centro.tipo_centro}</DetailRow>
              <DetailRow label="Territorio">{centro.territorio_codigo}</DetailRow>
              {centro.observaciones && (<DetailRow label="Observaciones">{centro.observaciones}</DetailRow>)}
            </InfoBlock>
            <InfoBlock title="Documentación y Activos">
              <div className="space-y-3">
                <a href={centro.repositorio_fotografico || '#'} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200">
                    <FiPaperclip /> Abrir OneDrive
                </a>
                <a href={createGlpiInventoryLink(centro.nombre_centro)} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200">
                    <FiDatabase /> Consultar Inventario
                </a>
              </div>
            </InfoBlock>
          </div>
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="flex items-center justify-between border-b pb-2 mb-4">
                    <h3 className="text-lg font-bold text-secondary">Proveedores Contratados</h3>
                    {user.rol === 'Administrador' && (
                      <button onClick={handleOpenAddProveedorModal} className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-primary/90">
                          <FiPlus /> Añadir Proveedor
                      </button>
                    )}
                </div>
                <div className="space-y-4">
                  {centro.servicios && centro.servicios.length > 0 ? (
                    centro.servicios.map(proveedorInfo => (
                      <ProveedorCard 
                        key={proveedorInfo.id} 
                        proveedorInfo={proveedorInfo}
                        onEdit={handleOpenEditProveedorModal}
                        onDelete={handleDeleteProveedorClick}
                        onContactClick={handleContactClick}
                      />
                    ))
                  ) : (
                    <p className="text-center text-slate-500 py-4">No hay proveedores registrados para este centro.</p>
                  )}
                </div>
            </div>
          </div>
        </div>
      </div>
      <AddProveedorModal isOpen={isProveedorModalOpen} onClose={() => { setIsProveedorModalOpen(false); setItemToEdit(null); }} onSuccess={handleModalSuccess} centroId={id} proveedores={proveedores} aplicaciones={aplicaciones} categorias={listas.categorias} itemToEdit={itemToEdit} />
      <CentroModal isOpen={isCentroModalOpen} onClose={() => setIsCentroModalOpen(false)} onSuccess={handleModalSuccess} itemToEdit={centro} listas={listas} />
      <ContactoDetailModal isOpen={contactToShow !== null} onClose={() => setContactToShow(null)} contacto={contactToShow} />
      <ConfirmModal isOpen={itemToDelete !== null} onClose={() => setItemToDelete(null)} onConfirm={handleConfirmDelete} title="Desvincular Proveedor">
        <p>¿Seguro que quieres desvincular a <strong>{itemToDelete?.nombre_proveedor || itemToDelete?.nombre_aplicacion}</strong> de este centro?</p>
      </ConfirmModal>
    </>
  );
}

export default CentroDetailPage;