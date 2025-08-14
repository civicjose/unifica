import React, { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import apiService from "../services/apiService";
import { useAuth } from "../context/AuthContext";
import CentroCard from "../components/centros/CentroCard";
import CentroModal from "../components/modals/CentroModal";
import ConfirmModal from "../components/modals/ConfirmModal";
import { FiSearch, FiPlus } from "react-icons/fi";

function CentrosPage() {
  const [centros, setCentros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { token, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [listas, setListas] = useState({ territorios: [], tiposCentro: [] });

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [centrosRes, territoriosRes, tiposCentroRes] = await Promise.all([
        apiService.getCentros(token),
        apiService.getTerritorios(token),
        apiService.getTiposCentro(token),
      ]);
      setCentros(centrosRes.data);
      setListas({
        territorios: territoriosRes.data,
        tiposCentro: tiposCentroRes.data,
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "No se pudieron cargar los datos.";
      const specificError = error.response?.data?.error;
      toast.error(
        specificError ? `${errorMessage} (${specificError})` : errorMessage,
        {
          duration: 6000,
        }
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers para los modales
  const handleOpenAddModal = () => {
    setItemToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (centro) => {
    // Para editar, necesitamos los datos completos del centro, así que los buscamos primero
    toast.promise(apiService.getCentroDetails(centro.id, token), {
      loading: "Cargando datos...",
      success: (res) => {
        setItemToEdit(res.data);
        setIsModalOpen(true);
        return "Datos listos para editar.";
      },
      error: "No se pudieron cargar los detalles del centro.",
    });
  };

  const handleDeleteClick = (centro) => {
    setItemToDelete(centro);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setItemToEdit(null);
    loadData(); // Recargamos la lista de centros para ver los cambios
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    toast.promise(apiService.deleteCentro(itemToDelete.id, token), {
      loading: "Eliminando...",
      success: () => {
        setItemToDelete(null);
        loadData();
        return "Centro eliminado con éxito.";
      },
      error: (err) => err.response?.data?.message || "Error al eliminar.",
    });
  };

  // Lógica de filtrado y agrupación
  const filteredCentros = useMemo(
    () =>
      centros.filter((centro) => {
        const search = searchTerm.toLowerCase();
        return (
          centro.nombre_centro?.toLowerCase().includes(search) ||
          centro.localidad?.toLowerCase().includes(search) ||
          centro.provincia?.toLowerCase().includes(search) ||
          centro.territorio_codigo?.toLowerCase().includes(search) ||
          centro.tipo_centro?.toLowerCase().includes(search)
        );
      }),
    [centros, searchTerm]
  );

  const groupedCentros = useMemo(() => {
    return filteredCentros.reduce((acc, centro) => {
      const tipo = centro.tipo_centro || "Sin Clasificar";
      if (!acc[tipo]) {
        acc[tipo] = [];
      }
      acc[tipo].push(centro);
      return acc;
    }, {});
  }, [filteredCentros]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          Centros y Servicios
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, tipo, localidad..."
              className="w-full rounded-full border bg-white py-2 pl-10 pr-4 shadow-sm sm:w-72"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          {user.rol === "Administrador" && (
            <button
              onClick={handleOpenAddModal}
              className="flex flex-shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-md"
            >
              <FiPlus /> Añadir Centro
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="p-4 text-center">Cargando centros...</p>
      ) : (
        <div className="space-y-8">
          {Object.keys(groupedCentros).length > 0 ? (
            Object.keys(groupedCentros)
              .sort()
              .map((tipo) => (
                <div key={tipo}>
                  <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b-2 border-primary/50 pb-2">
                    {tipo}
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {groupedCentros[tipo].map((centro) => (
                      <CentroCard
                        key={centro.id}
                        centro={centro}
                        onEdit={handleOpenEditModal}
                        onDelete={handleDeleteClick}
                      />
                    ))}
                  </div>
                </div>
              ))
          ) : (
            <p className="text-center text-slate-500 py-8">
              No se encontraron centros con los filtros actuales.
            </p>
          )}
        </div>
      )}

      <CentroModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setItemToEdit(null);
        }}
        onSuccess={handleModalSuccess}
        itemToEdit={itemToEdit}
        listas={listas}
      />
      <ConfirmModal
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Centro"
      >
        <p>
          ¿Seguro que quieres eliminar{" "}
          <strong>{itemToDelete?.nombre_centro}</strong>? Esta acción no se
          puede deshacer.
        </p>
      </ConfirmModal>
    </>
  );
}

export default CentrosPage;
