// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import UsersPage from './pages/UsersPage';
import TrabajadoresPage from './pages/TrabajadoresPage';

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
          {/* Estas son las rutas "hijas" que se mostrarán dentro del Outlet */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/trabajadores" element={<TrabajadoresPage />} />
          {/* Aquí irán las rutas de /sedes, /servicios, etc. */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;