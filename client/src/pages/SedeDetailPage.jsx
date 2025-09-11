import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPaperclip, FiDatabase, FiPlus, FiEdit } from 'react-icons/fi';
import ProveedorCard from '../components/centros/ProveedorCard';
import AddProveedorModal from '../components/modals/AddProveedorModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import SedeModal from '../components/modals/SedeModal';
import ContactoDetailModal from '../components/modals/ContactoDetailModal';
import TrabajadoresList from '../components/sedes/TrabajadoresList';
import TrabajadorDetailModal from '../components/modals/TrabajadorDetailModal';

const InfoBlock = ({ title, children, onEdit, className = '' }) => (
  <div className={`bg-white p-6 rounded-xl border shadow-sm h-full ${className}`}>
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

function SedeDetailPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [sede, setSede] = useState(null);
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('proveedores');
  const [trabajadorToShow, setTrabajadorToShow] = useState(null);

  const [isProveedorModalOpen, setIsProveedorModalOpen] = useState(false);
  const [isSedeModalOpen, setIsSedeModalOpen] = useState(false);
  const [contactToShow, setContactToShow] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [aplicaciones, setAplicaciones] = useState([]);
  const [listas, setListas] = useState({ territorios: [], categorias: [] });
  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const loadPageData = useCallback(async () => {
    if (token && id) {
      setLoading(true);
      try {
        const [sedeRes, trabajadoresRes, provRes, appRes, terrRes, catRes] = await Promise.all([
          apiService.getSedeDetails(id, token),
          apiService.getTrabajadoresBySede(id, token),
          apiService.getProveedores(token),
          apiService.getAplicaciones(token),
          apiService.getTerritorios(token),
          apiService.getCategoriasProveedor(token),
        ]);
        setSede(sedeRes.data);
        setTrabajadores(trabajadoresRes.data);
        setProveedores(provRes.data);
        setAplicaciones(appRes.data);
        setListas({ 
          territorios: terrRes.data,
          categorias: catRes.data
        });
      } catch (error) {
        toast.error('No se pudo cargar la información de la sede.');
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
  const handleWorkerClick = (trabajador) => { setTrabajadorToShow(trabajador); };
  
  const handleModalSuccess = () => {
    setIsProveedorModalOpen(false);
    setIsSedeModalOpen(false);
    setItemToEdit(null);
    loadPageData();
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    toast.promise(apiService.deleteProveedorFromSede(itemToDelete.id, token), {
      loading: 'Desvinculando...',
      success: () => { setItemToDelete(null); loadPageData(); return 'Proveedor desvinculado con éxito.'; },
      error: 'Error al desvincular.',
    });
  };
  
  const createGlpiInventoryLinkForSede = (sedeName) => {
    const baseUrl = 'https://sistemas.macrosad.com/front/computer.php';
    const params = new URLSearchParams({
      is_deleted: '0', as_map: '0', browse: '0',
      'criteria[0][link]': 'AND', 'criteria[0][field]': '12',
      'criteria[0][searchtype]': 'contains', 'criteria[0][value]': sedeName,
      itemtype: 'Computer',
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const tabStyle = "px-4 py-2 font-semibold rounded-t-lg focus:outline-none transition-colors";
  const activeTabStyle = "bg-white text-primary border-b-2 border-primary";
  const inactiveTabStyle = "text-slate-500 hover:bg-slate-200/50";

  if (loading) { return <p className="text-center p-8">Cargando datos de la sede...</p>; }
  if (!sede) { return <p className="text-center p-8">No se encontró la sede.</p>; }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <Link to="/sedes" className="flex items-center gap-2 text-primary font-semibold hover:underline">
                <FiArrowLeft /> Volver
            </Link>
            {['Administrador', 'Técnico'].includes(user.rol) && (
                <button onClick={() => setIsSedeModalOpen(true)} className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-blue-700">
                    <FiEdit /> Editar Sede
                </button>
            )}
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800">{sede.nombre_sede}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:items-start">
          <div className="md:col-span-1 space-y-6">
            <InfoBlock title="Información General">
              <DetailRow label="Dirección">{`${sede.direccion || ''}, ${sede.codigo_postal || ''} ${sede.localidad || ''}, ${sede.provincia || ''}`}</DetailRow>
              <DetailRow label="Teléfono">{sede.telefono}</DetailRow>
              <DetailRow label="Territorio">{sede.territorio_codigo}</DetailRow>
              {sede.observaciones && (<DetailRow label="Observaciones">{sede.observaciones}</DetailRow>)}
            </InfoBlock>
            <InfoBlock title="Documentación y Activos">
              <div className="space-y-3">
                <a href={sede.repositorio_fotografico || '#'} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200">
                    <FiPaperclip /> Abrir OneDrive
                </a>
                <a href={createGlpiInventoryLinkForSede(sede.nombre_sede)} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200">
                    <FiDatabase /> Consultar Inventario
                </a>
              </div>
            </InfoBlock>
          </div>
          <div className="md:col-span-2">
              <div className="border-b border-slate-300">
                <nav className="flex flex-wrap -mb-px">
                  <button onClick={() => setActiveTab('proveedores')} className={`${tabStyle} ${activeTab === 'proveedores' ? activeTabStyle : inactiveTabStyle}`}>
                    Proveedores
                  </button>
                  <button onClick={() => setActiveTab('trabajadores')} className={`${tabStyle} ${activeTab === 'trabajadores' ? activeTabStyle : inactiveTabStyle}`}>
                    Trabajadores
                  </button>
                </nav>
              </div>
              <div className="bg-white p-6 rounded-b-xl border-x border-b shadow-sm">
                {activeTab === 'proveedores' && (
                  <div className="space-y-4">
                     {['Administrador', 'Técnico'].includes(user.rol) && (
                        <div className="flex justify-end">
                            <button onClick={handleOpenAddProveedorModal} className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-primary/90">
                                <FiPlus /> Añadir Proveedor
                            </button>
                        </div>
                      )}
                    {sede.proveedores && sede.proveedores.length > 0 ? (
                       sede.proveedores.map(proveedorInfo => {
                        const categoriaDef = listas.categorias.find(c => c.nombre_categoria === proveedorInfo.categoria);
                        return (
                          <ProveedorCard 
                            key={proveedorInfo.id} 
                            proveedorInfo={proveedorInfo}
                            camposDefinicion={categoriaDef ? categoriaDef.campos_formulario : []}
                            onEdit={['Administrador', 'Técnico'].includes(user.rol) ? handleOpenEditProveedorModal : undefined}
                            onDelete={user.rol === 'Administrador' ? handleDeleteProveedorClick : undefined}
                            onContactClick={handleContactClick}
                          />
                        );
                      })
                    ) : (
                      <p className="text-center text-slate-500 py-4">No hay proveedores registrados para esta sede.</p>
                    )}
                  </div>
                )}
                {activeTab === 'trabajadores' && (
                  <TrabajadoresList trabajadores={trabajadores} onWorkerClick={handleWorkerClick} />
                )}
              </div>
          </div>
        </div>
      </div>
      <AddProveedorModal isOpen={isProveedorModalOpen} onClose={() => { setIsProveedorModalOpen(false); setItemToEdit(null); }} onSuccess={handleModalSuccess} sedeId={id} proveedores={proveedores} aplicaciones={aplicaciones} categorias={listas.categorias} itemToEdit={itemToEdit} />
      <SedeModal isOpen={isSedeModalOpen} onClose={() => setIsSedeModalOpen(false)} onSuccess={handleModalSuccess} itemToEdit={sede} listas={listas} />
      <ContactoDetailModal isOpen={contactToShow !== null} onClose={() => setContactToShow(null)} contacto={contactToShow} />
      <TrabajadorDetailModal isOpen={trabajadorToShow !== null} onClose={() => setTrabajadorToShow(null)} trabajador={trabajadorToShow} />
      <ConfirmModal isOpen={itemToDelete !== null} onClose={() => setItemToDelete(null)} onConfirm={handleConfirmDelete} title="Desvincular Proveedor de Sede">
        <p>¿Seguro que quieres desvincular a <strong>{itemToDelete?.nombre_proveedor || itemToDelete?.nombre_aplicacion}</strong> de esta sede?</p>
      </ConfirmModal>
    </>
  );
}

export default SedeDetailPage;