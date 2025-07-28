import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { RxDashboard } from 'react-icons/rx';
import { FiUsers, FiGlobe, FiServer, FiLogOut, FiUser } from 'react-icons/fi';
import { FaUserTie } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

// El array de enlaces de navegación
const navLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: RxDashboard },
   { name: 'Trabajadores', path: '/trabajadores', icon: FaUserTie },
  { name: 'Usuarios', path: '/users', icon: FiUsers, roles: ['Administrador'] },
  { name: 'Sedes', path: '/sedes', icon: FiGlobe, roles: ['Administrador', 'Técnico'] },
  { name: 'Servicios', path: '/servicios', icon: FiServer },
];

function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estilo para el enlace activo
  const activeLinkStyle = {
    backgroundColor: '#e5007e', // Tu color primario
    color: 'white',
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Contenedor principal del Sidebar con clases para la responsividad */}
      <div 
        className={`fixed z-30 flex h-screen w-64 flex-col bg-secondary text-white transition-transform duration-300 ease-in-out md:static md:translate-x-0 
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Encabezado con el logo */}
        <div className="flex h-20 items-center justify-center border-b border-white/10">
          <h1 className="font-poppins text-3xl font-bold text-white">
            Unifica
          </h1>
        </div>

        {/* Navegación principal */}
        <nav className="flex-grow p-4">
          <ul>
            {navLinks
              .filter(link => {
                if (!link.roles) return true;
                return user && link.roles.includes(user.rol);
              })
              .map((link) => (
                <li key={link.name} className="mb-2">
                  <NavLink
                    to={link.path}
                    style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                    className="flex items-center rounded-md px-4 py-3 text-lg transition-colors hover:bg-primary/80"
                    onClick={() => setIsOpen(false)} // Cierra el menú al hacer clic en un enlace en móvil
                  >
                    <link.icon className="mr-3 h-6 w-6" />
                    {link.name}
                  </NavLink>
                </li>
              ))}
          </ul>
        </nav>
        
        {/* Sección de perfil y cerrar sesión */}
        <div className="p-4 border-t border-white/10">
          <div className='flex items-center p-2 rounded-md mb-2 bg-black/20'>
            <FiUser className="h-6 w-6 mr-3 text-accent-2"/>
            <div>
              <p className='text-sm font-bold'>{user.rol}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center rounded-md px-4 py-3 text-lg text-red-400 transition-colors hover:bg-red-500 hover:text-white"
          >
            <FiLogOut className="mr-3 h-6 w-6" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Overlay para cerrar el menú al hacer clic fuera (solo en móvil) */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
        ></div>
      )}
    </>
  );
}

export default Sidebar;