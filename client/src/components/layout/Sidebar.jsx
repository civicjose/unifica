import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { RxDashboard } from 'react-icons/rx';
import { FiGlobe, FiLogOut, FiUser, FiArchive, FiSettings, FiTruck } from 'react-icons/fi';
import { FaUserTie } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: RxDashboard },
  { name: 'Sedes', path: '/sedes', icon: FiArchive },
  { name: 'Centros', path: '/centros', icon: FiGlobe },
  { name: 'Trabajadores', path: '/trabajadores', icon: FaUserTie },
  { name: 'Proveedores', path: '/proveedores', icon: FiTruck },
];

function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const activeLinkStyle = {
    backgroundColor: '#e5007e',
    color: 'white',
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <div 
        className={`fixed z-30 flex h-screen w-64 flex-col bg-secondary text-white transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:flex-shrink-0 
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-20 items-center justify-center border-b border-white/10">
          <h1 className="font-poppins text-3xl font-bold text-white">
            Unifica
          </h1>
        </div>

        <nav className="flex-grow p-4 space-y-4 overflow-y-auto">
          <ul>
            {navLinks.map((link) => (
                <li key={link.name} className="mb-2">
                  <NavLink
                    to={link.path}
                    style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                    className="flex items-center rounded-md px-4 py-3 text-lg transition-colors hover:bg-primary/80"
                    onClick={() => setIsOpen(false)}
                  >
                    <link.icon className="mr-3 h-6 w-6" />
                    {link.name}
                  </NavLink>
                </li>
              ))}
          </ul>
          {user.rol === 'Administrador' && (
            <div>
              <h2 className="px-4 pt-4 pb-2 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Administración
              </h2>
              <ul>
                <li className="mb-2">
                  <NavLink
                    to="/configuracion"
                    style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                    className="flex items-center rounded-md px-4 py-3 text-lg transition-colors hover:bg-primary/80"
                    onClick={() => setIsOpen(false)}
                  >
                    <FiSettings className="mr-3 h-6 w-6" />
                    Configuración
                  </NavLink>
                </li>
              </ul>
            </div>
          )}
        </nav>
        
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