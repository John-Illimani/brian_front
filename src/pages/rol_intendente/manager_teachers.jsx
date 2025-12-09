import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Search } from "lucide-react";
import {
  getUsuarios,
  createUsuario,
  updateUsuarioById,
  deleteUsuarioById,
} from "../../api/api.usuario";

export const GestionDocentes = () => {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeError, setMensajeError] = useState("");

  // Un solo formulario para agregar / editar
  const [formDocente, setFormDocente] = useState({
    nombre: "",
    apellido: "",
    username: "",
    password: "",
    rol: "docente",
  });

  // Si editId es null => modo "Agregar"
  // Si tiene un id => modo "Editar"
  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState("");

  // ==== Cargar docentes desde la API ====
  const cargarDocentes = async () => {
    try {
      setLoading(true);
      setMensajeError("");
      const res = await getUsuarios();
      // res.data debe ser un array de usuarios tipo:
      // { usuario_id, username, rol, nombre, apellido, fecha_creacion }
      const soloDocentes = (res.data || []).filter(
        (u) => u.rol && u.rol.toLowerCase() === "docente"
      );
      setDocentes(soloDocentes);
    } catch (error) {
      console.error(error);
      setMensajeError("Error al cargar los docentes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDocentes();
  }, []);

  const resetFormulario = () => {
    setFormDocente({
      nombre: "",
      apellido: "",
      username: "",
      password: "",
      rol: "docente",
    });
    setEditId(null);
  };

  // ==== Agregar nuevo docente ====
  const handleAgregar = async () => {
    if (
      !formDocente.nombre ||
      !formDocente.apellido ||
      !formDocente.username ||
      !formDocente.password
    ) {
      alert("Por favor complete nombre, apellido, username y password.");
      return;
    }

    try {
      const payload = {
        nombre: formDocente.nombre,
        apellido: formDocente.apellido,
        username: formDocente.username,
        password: formDocente.password,
        rol: "docente",
      };

      const res = await createUsuario(payload);
      const creado = res.data;

      if (creado && creado.usuario_id) {
        if (creado.rol?.toLowerCase() === "docente") {
          setDocentes((prev) => [...prev, creado]);
        }
      } else {
        await cargarDocentes();
      }

      resetFormulario();
    } catch (error) {
      console.error("Error al crear docente:", error.response?.data || error);
      alert(
        `Error al crear docente${
          error.response?.data?.message
            ? ": " + error.response.data.message
            : ""
        }`
      );
    }
  };

  // ==== Eliminar docente ====
  const handleEliminar = async (usuario_id) => {
    if (!window.confirm("¿Desea eliminar este docente?")) return;
    try {
      await deleteUsuarioById(usuario_id);
      setDocentes((prev) => prev.filter((d) => d.usuario_id !== usuario_id));
    } catch (error) {
      console.error(error);
      alert("Error al eliminar docente.");
    }
  };

  // ==== Editar docente (cargar datos en el formulario de arriba) ====
  const handleEditar = (docente) => {
    setEditId(docente.usuario_id);
    setFormDocente({
      nombre: docente.nombre || "",
      apellido: docente.apellido || "",
      username: docente.username || "",
      password: "", // NO mostramos el hash, se queda vacío para que solo ponga una nueva si quiere
      rol: docente.rol || "docente",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ==== Guardar edición en API (usa el mismo formulario) ====
  const handleGuardarEdicion = async () => {
    if (!editId) return;

    if (!formDocente.nombre || !formDocente.apellido || !formDocente.username) {
      alert("Nombre, apellido y username son obligatorios.");
      return;
    }

    try {
      const payload = {
        nombre: formDocente.nombre,
        apellido: formDocente.apellido,
        username: formDocente.username,
        rol: "docente",
      };

      // Solo enviamos password si el usuario escribió una nueva
      if (formDocente.password && formDocente.password.trim() !== "") {
        payload.password = formDocente.password;
      }

      const res = await updateUsuarioById(editId, payload);
      const actualizado = res.data || payload;

      setDocentes((prev) =>
        prev.map((d) =>
          d.usuario_id === editId ? { ...d, ...actualizado } : d
        )
      );
      resetFormulario();
    } catch (error) {
      console.error("Error al actualizar docente:", error.response?.data || error);
      alert(
        `Error al actualizar docente${
          error.response?.data?.message
            ? ": " + error.response.data.message
            : ""
        }`
      );
    }
  };

  // ==== Buscar docentes ====
  const docentesFiltrados = docentes.filter((d) => {
    const texto =
      `${d.nombre || ""} ${d.apellido || ""} ${d.username || ""} ${
        d.rol || ""
      }`.toLowerCase();
    return texto.includes(search.toLowerCase());
  });

  const esModoEdicion = editId !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white p-6 flex flex-col items-center">
      {/* Encabezado */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-extrabold text-blue-100 mb-6 flex items-center gap-3"
      >
        <Users className="text-blue-300" size={30} /> Gestión de Docentes
      </motion.h1>

      {/* Buscador */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-4xl bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-lg flex flex-col md:flex-row gap-3 items-center"
      >
        <div className="relative w-full md:w-2/3">
          <Search className="absolute left-3 top-2.5 text-blue-300" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-white/20 text-blue-50 border border-white/20 
                       focus:ring-2 focus:ring-blue-400 outline-none placeholder-blue-200"
          />
        </div>
      </motion.div>

      {/* Formulario agregar / editar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-4xl bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-lg mt-6"
      >
        <h2 className="text-lg font-semibold text-blue-100 mb-3 flex items-center gap-2">
          <Plus size={20} className="text-blue-300" />{" "}
          {esModoEdicion ? "Editar docente" : "Agregar nuevo docente"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Nombre"
            value={formDocente.nombre}
            onChange={(e) =>
              setFormDocente({ ...formDocente, nombre: e.target.value })
            }
            className="p-2 rounded-md bg-white/20 border border-white/20 text-blue-50 
                       placeholder-blue-200 focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <input
            type="text"
            placeholder="Apellido"
            value={formDocente.apellido}
            onChange={(e) =>
              setFormDocente({ ...formDocente, apellido: e.target.value })
            }
            className="p-2 rounded-md bg-white/20 border border-white/20 text-blue-50 
                       placeholder-blue-200 focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <input
            type="text"
            placeholder="Username"
            value={formDocente.username}
            onChange={(e) =>
              setFormDocente({ ...formDocente, username: e.target.value })
            }
            className="p-2 rounded-md bg-white/20 border border-white/20 text-blue-50 
                       placeholder-blue-200 focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <input
            type="password"
            placeholder={esModoEdicion ? "Nueva contraseña (opcional)" : "Password"}
            value={formDocente.password}
            onChange={(e) =>
              setFormDocente({ ...formDocente, password: e.target.value })
            }
            className="p-2 rounded-md bg-white/20 border border-white/20 text-blue-50 
                       placeholder-blue-200 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          {esModoEdicion && (
            <button
              onClick={resetFormulario}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-semibold"
            >
              Cancelar edición
            </button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={esModoEdicion ? handleGuardarEdicion : handleAgregar}
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-md 
                       shadow-md hover:shadow-blue-400/30 transition-all duration-300 px-6 py-2"
          >
            {esModoEdicion ? "Guardar cambios" : "Agregar"}
          </motion.button>
        </div>
      </motion.div>

      {/* Mensaje de error */}
      {mensajeError && (
        <div className="mt-4 text-red-200 text-sm bg-red-900/40 border border-red-500/40 px-4 py-2 rounded-lg">
          {mensajeError}
        </div>
      )}

      {/* Tabla de docentes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="w-full max-w-5xl mt-8 overflow-x-auto"
      >
        {loading ? (
          <div className="text-center py-10 text-blue-200">Cargando docentes...</div>
        ) : (
          <table className="min-w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg overflow-hidden">
            <thead className="bg-blue-700/60 text-blue-100 uppercase text-sm">
              <tr>
                <th className="py-3 px-6 text-left font-semibold">Nombre</th>
                <th className="py-3 px-6 text-left font-semibold">Username</th>
                <th className="py-3 px-6 text-left font-semibold">Rol</th>
                <th className="py-3 px-6 text-left font-semibold">Fecha creación</th>
                <th className="py-3 px-6 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {docentesFiltrados.length > 0 ? (
                docentesFiltrados.map((d) => (
                  <tr
                    key={d.usuario_id}
                    className="border-b border-white/10 hover:bg-blue-700/30 transition-all"
                  >
                    <td className="py-3 px-6">
                      {`${d.nombre || ""} ${d.apellido || ""}`}
                    </td>
                    <td className="py-3 px-6">{d.username}</td>
                    <td className="py-3 px-6">
                      <span className="px-2 py-1 rounded-full bg-blue-900/50 text-xs uppercase tracking-wide">
                        {d.rol}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      {d.fecha_creacion
                        ? new Date(d.fecha_creacion).toLocaleString("es-BO", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "-"}
                    </td>
                    <td className="py-3 px-6 text-center space-x-2">
                      <button
                        onClick={() => handleEditar(d)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm font-semibold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(d.usuario_id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-semibold"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-6 text-blue-300 italic"
                  >
                    No se encontraron docentes con rol "docente".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
};
