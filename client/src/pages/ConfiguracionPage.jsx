import React, { useState } from 'react';
import apiService from '../services/apiService';
import GenericManagementPage from './GenericManagementPage';
import AplicacionesPage from './AplicacionesPage';
import UsersPage from './UsersPage'; // <-- 1. Importa la página de usuarios

// Configuración para cada pestaña
const TABS_CONFIG = {
  // 2. Añade la nueva entrada para 'Usuarios'
  Usuarios: {
    component: UsersPage,
    props: {} // La página de usuarios ya gestiona sus propios datos
  },
  Puestos: {
    component: GenericManagementPage,
    props: {
      title: "Puestos",
      fields: [{ name: 'nombre', label: 'Nombre del Puesto' }],
      fetchAll: apiService.getPuestos,
      createItem: apiService.createPuesto,
      updateItem: apiService.updatePuesto,
      deleteItem: apiService.deletePuesto,
    }
  },
  Departamentos: {
    component: GenericManagementPage,
    props: {
      title: "Departamentos",
      fields: [{ name: 'nombre', label: 'Nombre del Departamento' }],
      fetchAll: apiService.getDepartamentos,
      createItem: apiService.createDepartamento,
      updateItem: apiService.updateDepartamento,
      deleteItem: apiService.deleteDepartamento,
    }
  },
  Territorios: {
    component: GenericManagementPage,
    props: {
      title: "Territorios",
      fields: [
        { name: 'codigo', label: 'Código (ej: DT01)' },
        { name: 'zona', label: 'Zona (ej: Jaén)' }
      ],
      fetchAll: apiService.getTerritorios,
      createItem: apiService.createTerritorio,
      updateItem: apiService.updateTerritorio,
      deleteItem: apiService.deleteTerritorio,
    }
  },
  Proveedores: {
    component: GenericManagementPage,
    props: {
      title: "Proveedores",
      fields: [
        { name: 'nombre_proveedor', label: 'Nombre del Proveedor', required: true },
        { name: 'url_proveedor', label: 'URL (Opcional)' },
        { name: 'contacto_principal', label: 'Contacto (Opcional)' },
        { name: 'telefono', label: 'Teléfono (Opcional)' },
        { name: 'email', label: 'Email (Opcional)' },
      ],
      fetchAll: apiService.getProveedores,
      createItem: apiService.createProveedor,
      updateItem: apiService.updateProveedor,
      deleteItem: apiService.deleteProveedor,
    }
  },
  Aplicaciones: {
    component: AplicacionesPage,
    props: {}
  },
  'Tipos de Centro': {
    component: GenericManagementPage,
    props: {
        title: "Tipos de Centro",
        fields: [
            { name: 'abreviatura', label: 'Abreviatura (ej: RPM)' },
            { name: 'nombre_completo', label: 'Nombre Completo (ej: Residencia Para Mayores)' }
        ],
        // ***** CORRECCIÓN AQUÍ *****
        // Apuntamos a las nuevas funciones específicas que hemos creado
        fetchAll: apiService.getTiposCentro,
        createItem: apiService.createTipoCentro,
        updateItem: apiService.updateTipoCentro,
        deleteItem: apiService.deleteTipoCentro,
    }
  }
};

function ConfiguracionPage() {
  // 3. Hacemos que la pestaña por defecto sea 'Usuarios'
  const [activeTab, setActiveTab] = useState('Usuarios'); 
  
  const ActiveComponent = TABS_CONFIG[activeTab].component;
  const componentProps = TABS_CONFIG[activeTab].props;

  const tabStyle = "px-4 py-2 font-semibold rounded-t-lg transition-colors";
  const activeTabStyle = "bg-white text-primary border-b-2 border-primary";
  const inactiveTabStyle = "bg-transparent text-slate-500 hover:bg-slate-200/50";

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-gray-800">Configuración del Sistema</h1>
      
      <div className="border-b border-slate-300">
        <nav className="flex -mb-px">
          {Object.keys(TABS_CONFIG).map(tabName => (
            <button
              key={tabName}
              onClick={() => setActiveTab(tabName)}
              className={`${tabStyle} ${activeTab === tabName ? activeTabStyle : inactiveTabStyle}`}
            >
              {tabName}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-4">
        <ActiveComponent {...componentProps} />
      </div>
    </div>
  );
}

export default ConfiguracionPage;