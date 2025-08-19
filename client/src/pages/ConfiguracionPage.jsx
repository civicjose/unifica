import React, { useState } from 'react';
import apiService from '../services/apiService';

// Importa los componentes que se usarán en las pestañas
import GenericManagementPage from './GenericManagementPage';
import UsersPage from './UsersPage';
import CategoriasProveedorManager from '../components/configuracion/CategoriasProveedorManager';

// Objeto de configuración actualizado, sin Proveedores ni Aplicaciones
const TABS_CONFIG = {
  'Usuarios': {
    component: UsersPage,
    props: {}
  },
  'Puestos': {
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
  'Departamentos': {
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
  'Territorios': {
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
  'Categorías Proveedor': {
    component: CategoriasProveedorManager,
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
        fetchAll: apiService.getTiposCentro,
        createItem: apiService.createTipoCentro,
        updateItem: apiService.updateTipoCentro,
        deleteItem: apiService.deleteTipoCentro,
    }
  }
};

function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('Usuarios'); 
  
  const ActiveComponent = TABS_CONFIG[activeTab].component;
  const componentProps = TABS_CONFIG[activeTab].props;

  const tabStyle = "px-4 py-2 font-semibold rounded-t-lg transition-colors focus:outline-none";
  const activeTabStyle = "bg-white text-primary border-b-2 border-primary";
  const inactiveTabStyle = "bg-transparent text-slate-500 hover:bg-slate-200/50";

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-gray-800">Configuración del Sistema</h1>
      
      <div className="border-b border-slate-300">
        <nav className="flex flex-wrap -mb-px">
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