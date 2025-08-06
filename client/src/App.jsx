import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import UsersPage from './pages/UsersPage';
import TrabajadoresPage from './pages/TrabajadoresPage';

// Importamos el nuevo componente genérico y el servicio
import GenericManagementPage from './pages/GenericManagementPage';
import trabajadoresService from './services/trabajadoresService';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública de Login */}
        <Route path="/" element={<LoginPage />} />

        {/* Rutas protegidas que usan el MainLayout */}
        <Route 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/trabajadores" element={<TrabajadoresPage />} />
          
          {/* --- Nuevas Rutas de Gestión --- */}
          <Route
            path="/gestion/puestos"
            element={
              <GenericManagementPage
                title="Puestos"
                fields={[{ name: 'nombre', label: 'Nombre del Puesto' }]}
                fetchAll={trabajadoresService.getPuestos}
                createItem={trabajadoresService.createPuesto}
                updateItem={trabajadoresService.updatePuesto}
                deleteItem={trabajadoresService.deletePuesto}
              />
            }
          />
          <Route
            path="/gestion/departamentos"
            element={
              <GenericManagementPage
                title="Departamentos"
                fields={[{ name: 'nombre', label: 'Nombre del Departamento' }]}
                fetchAll={trabajadoresService.getDepartamentos}
                createItem={trabajadoresService.createDepartamento}
                updateItem={trabajadoresService.updateDepartamento}
                deleteItem={trabajadoresService.deleteDepartamento}
              />
            }
          />
          <Route
            path="/gestion/territorios"
            element={
              <GenericManagementPage
                title="Territorios"
                fields={[
                  { name: 'codigo', label: 'Código (ej: DT01)' },
                  { name: 'zona', label: 'Zona (ej: Jaén)' }
                ]}
                fetchAll={trabajadoresService.getTerritorios}
                createItem={trabajadoresService.createTerritorio}
                updateItem={trabajadoresService.updateTerritorio}
                deleteItem={trabajadoresService.deleteTerritorio}
              />
            }
          />
          
          {/* Aquí irán las rutas de /sedes, /servicios, etc. */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;