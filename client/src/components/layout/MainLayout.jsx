// src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';
import { FiMenu } from 'react-icons/fi'; // Icono para el botón de menú

function MainLayout() {
  // Estado para controlar la visibilidad del menú en móviles
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen">
      {/* Pasamos el estado y la función para que el Sidebar sepa si debe mostrarse */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="w-full flex-grow p-4 md:p-8 bg-gray-100">
        {/* Botón de menú que SOLO es visible en pantallas pequeñas (hasta md) */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden p-2 mb-4 rounded-md bg-white shadow"
        >
          <FiMenu className="h-6 w-6 text-gray-700" />
        </button>

        <Outlet />
      </main>

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}

export default MainLayout;