import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';
import { FiMenu } from 'react-icons/fi';

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    // 👇 1. Contenedor principal: Ocupa toda la altura de la pantalla y oculta cualquier desbordamiento.
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* 👇 2. Contenido principal: Crece para ocupar el espacio y es el ÚNICO elemento con scroll vertical. */}
      <main className="flex-grow overflow-y-auto p-4 md:p-8">
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