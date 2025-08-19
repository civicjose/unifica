import { HashRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import TrabajadoresPage from './pages/TrabajadoresPage';
import CentrosPage from './pages/CentrosPage';
import CentroDetailPage from './pages/CentroDetailPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import SedesPage from './pages/SedesPage';
import SedeDetailPage from './pages/SedeDetailPage';
import ProveedoresPage from './pages/ProveedoresPage';
import ProveedorDetailPage from './pages/ProveedoresDetailPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/trabajadores" element={<TrabajadoresPage />} />
          <Route path="/sedes" element={<SedesPage />} />
          <Route path="/sedes/:id" element={<SedeDetailPage />} />
          <Route path="/centros" element={<CentrosPage />} />
          <Route path="/centros/:id" element={<CentroDetailPage />} />
          <Route path="/proveedores" element={<ProveedoresPage />} />
          <Route path="/proveedores/:id" element={<ProveedorDetailPage />} />
          <Route path="/configuracion" element={<ConfiguracionPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;