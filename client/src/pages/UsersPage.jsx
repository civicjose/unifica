import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import AddUserModal from '../components/modals/AddUserModal';
import EditUserModal from '../components/modals/EditUserModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import UsersTable from '../components/users/UsersTable';
import UserCard from '../components/users/UserCard';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { FiSearch } from 'react-icons/fi';

function UsersPage() {
  // Estados para los modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  // Estados para los datos y la UI
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'nombre_completo', direction: 'ascending' });

  const { token, user: currentUser } = useAuth();

  useEffect(() => {
    if (token) {
      setLoading(true);
      userService.getUsers(token)
        .then(data => setUsers(data))
        .catch(error => toast.error(error.response?.data?.message || "No se pudieron cargar los usuarios."))
        .finally(() => setLoading(false));
    }
  }, [token]);

  const sortedAndFilteredUsers = useMemo(() => {
    let filteredUsers = [...users];

    if (searchTerm) {
      filteredUsers = filteredUsers.filter(user =>
        user.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig.key !== null) {
      filteredUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredUsers;
  }, [users, searchTerm, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const refreshUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers(token);
      setUsers(data);
    } catch (error) {
      toast.error("No se pudo refrescar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserAdded = () => { setIsAddModalOpen(false); refreshUsers(); };
  const handleEditClick = (user) => { setUserToEdit(user); setIsEditModalOpen(true); };
  const handleUserUpdated = () => { setIsEditModalOpen(false); setUserToEdit(null); refreshUsers(); };
  const handleDeleteClick = (user) => {
    if (currentUser.id === user.id) {
      toast.error('No puedes eliminar tu propia cuenta.');
      return;
    }
    setUserToDelete(user);
  };
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await userService.deleteUser(userToDelete.id, token);
      toast.success(`Usuario '${userToDelete.nombre_completo}' eliminado.`);
      setUsers(users.filter((u) => u.id !== userToDelete.id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar el usuario.');
    } finally {
      setUserToDelete(null);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full rounded-full border border-gray-300 bg-white py-2 pl-10 pr-4 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex transform items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-purple-600 px-5 py-2.5 font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            + Añadir Usuario
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
        {loading ? <p className="p-4 text-center">Cargando...</p> : (
          <>
            <div className="grid grid-cols-1 gap-6 md:hidden">
              {sortedAndFilteredUsers.length > 0 ? (
                sortedAndFilteredUsers.map(user => (
                  <UserCard key={user.id} user={user} onEditClick={handleEditClick} onDeleteClick={handleDeleteClick} />
                ))
              ) : (
                <p className="p-4 text-center text-gray-500">No se encontraron usuarios.</p>
              )}
            </div>
            <div className="hidden md:block">
              <UsersTable users={sortedAndFilteredUsers} onEditClick={handleEditClick} onDeleteClick={handleDeleteClick} requestSort={requestSort} sortConfig={sortConfig} />
            </div>
          </>
        )}
      </div>

      <AddUserModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onUserAdded={handleUserAdded} />
      <EditUserModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUserUpdated={handleUserUpdated} user={userToEdit} />
      <ConfirmModal isOpen={userToDelete !== null} onClose={() => setUserToDelete(null)} onConfirm={handleConfirmDelete} title="Eliminar Usuario">
        <p>¿Estás seguro de que deseas eliminar permanentemente al usuario <strong>{userToDelete?.nombre_completo}</strong>? Esta acción no se puede deshacer.</p>
      </ConfirmModal>
    </>
  );
}

export default UsersPage;