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

const InfoBlock = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl border shadow-sm">
    <h3 className="text-lg font-bold text-secondary border-b pb-2 mb-4">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const DetailRow = ({ label, children }) => (
  <div>
    <p className="text-sm font-semibold text-slate-500">{label}</p>
    <div className="text-slate-800 whitespace-pre-wrap mt-1">{children || '-'}</div>
  </div>
);

function SedeDetailPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [sede, setSede] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isProveedorModalOpen, setIsProveedorModalOpen] = useState(false);
  const [isSedeModalOpen, setIsSedeModalOpen] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [aplicaciones, setAplicaciones] = useState([]);
  const [listas, setListas] = useState({ territorios: [] });
  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const loadPageData = useCallback(async () => {
    if (token && id) {
      setLoading(true);
      try {
        const [sedeRes, provRes, appRes, terrRes] = await Promise.all([
          apiService.getSedeDetails(id, token),
          apiService.getProveedores(token),
          apiService.getAplicaciones(token),
          apiService.getTerritorios(token),
        ]);
        setSede(sedeRes.data);
        setProveedores(provRes.data);
        setAplicaciones(appRes.data);
        setListas({ territorios: terrRes.data });
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
      'criteria[0][link]': 'AND', 'criteria[0][field]': '3',
      'criteria[0][searchtype]': 'contains', 'criteria[0][value]': sedeName,
      itemtype: 'Computer',
    });
    return `${baseUrl}?${params.toString()}`;
  };

  if (loading) { return <p className="text-center p-8">Cargando datos de la sede...</p>; }
  if (!sede) { return <p className="text-center p-8">No se encontró la sede.</p>; }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <Link to="/sedes" className="flex items-center gap-2 text-primary font-semibold hover:underline">
                <FiArrowLeft /> Volver a la lista de sedes
            </Link>
            {user.rol === 'Administrador' && (
                <button onClick={() => setIsSedeModalOpen(true)} className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-blue-700">
                    <FiEdit /> Editar Sede
                </button>
            )}
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800">{sede.nombre_sede}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <InfoBlock title="Información General">
              <DetailRow label="Dirección">{`${sede.direccion || ''}, ${sede.codigo_postal || ''} ${sede.localidad || ''}, ${sede.provincia || ''}`}</DetailRow>
              <DetailRow label="Teléfono">{sede.telefono}</DetailRow>
              <DetailRow label="Territorio">{sede.territorio_codigo}</DetailRow>
              {sede.observaciones && (
                <DetailRow label="Observaciones">{sede.observaciones}</DetailRow>
              )}
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
                    {sede.proveedores && sede.proveedores.length > 0 ? (
                      sede.proveedores.map(proveedorInfo => (
                        <ProveedorCard 
                          key={proveedorInfo.id} 
                          proveedorInfo={proveedorInfo}
                          onEdit={handleOpenEditProveedorModal}
                          onDelete={handleDeleteProveedorClick}
                        />
                      ))
                    ) : (
                      <p className="text-center text-slate-500 py-4">No hay proveedores registrados para esta sede.</p>
                    )}
                  </div>
              </div>
          </div>
        </div>
      </div>

      <AddProveedorModal
        isOpen={isProveedorModalOpen}
        onClose={() => { setIsProveedorModalOpen(false); setItemToEdit(null); }}
        onSuccess={handleModalSuccess}
        sedeId={id}
        proveedores={proveedores}
        aplicaciones={aplicaciones}
        itemToEdit={itemToEdit}
      />
      <SedeModal
        isOpen={isSedeModalOpen}
        onClose={() => setIsSedeModalOpen(false)}
        onSuccess={handleModalSuccess}
        itemToEdit={sede}
        listas={listas}
      />
      <ConfirmModal
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Desvincular Proveedor de Sede"
      >
        <p>¿Seguro que quieres desvincular a <strong>{itemToDelete?.nombre_proveedor || itemToDelete?.nombre_aplicacion}</strong> de esta sede?</p>
      </ConfirmModal>
    </>
  );
}

export default SedeDetailPage;