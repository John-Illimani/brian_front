import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Edit3, Save, Camera } from "lucide-react";
import { getUsuarios } from "../../api/api.usuario";

export const PerfilDocente = () => {
  const [editable, setEditable] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [docente, setDocente] = useState({
    username: "",
    nombre: "",
    email: "",
    telefono: "",
    foto: "/default-profile.png",
    usuario_id: null,
  });

  // Cargar datos desde API + localStorage
  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const storedUsername = localStorage.getItem("username"); // 👈 ajusta la key si usas otra
        if (!storedUsername) {
          console.warn("No se encontró username en localStorage");
          setCargando(false);
          return;
        }

        const res = await getUsuarios();
        const lista = res.data || [];
        const user = lista.find((u) => u.username === storedUsername);

        if (!user) {
          console.warn("No se encontró usuario con username:", storedUsername);
          setCargando(false);
          return;
        }

        // Datos extra del perfil guardados en localStorage
        const perfilLSRaw = localStorage.getItem(
          `perfilDocente_${storedUsername}`
        );
        let perfilLS = {};
        if (perfilLSRaw) {
          try {
            perfilLS = JSON.parse(perfilLSRaw);
          } catch {
            perfilLS = {};
          }
        }

        const fotoLS =
          perfilLS.foto || localStorage.getItem(`foto_${storedUsername}`);

        setDocente({
          username: user.username,
          nombre: `${user.nombre} ${user.apellido}`,
          email: perfilLS.email || "",
          telefono: perfilLS.telefono || "",
          foto: fotoLS || "/default-profile.png",
          usuario_id: user.usuario_id,
        });
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "foto" && files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64 = reader.result; // data URL
        setDocente((prev) => {
          const updated = { ...prev, foto: base64 };
          // Guardar sólo en localStorage ligado al username
          if (updated.username) {
            const perfil = {
              email: prev.email,
              telefono: prev.telefono,
              foto: base64,
            };
            localStorage.setItem(
              `perfilDocente_${updated.username}`,
              JSON.stringify(perfil)
            );
            localStorage.setItem(`foto_${updated.username}`, base64);
          }
          return updated;
        });
      };

      reader.readAsDataURL(file);
    } else {
      setDocente((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleGuardar = () => {
    setEditable(false);

    if (docente.username) {
      const perfil = {
        email: docente.email,
        telefono: docente.telefono,
        foto: docente.foto,
      };
      localStorage.setItem(
        `perfilDocente_${docente.username}`,
        JSON.stringify(perfil)
      );
      localStorage.setItem(`foto_${docente.username}`, docente.foto);
    }

    alert("✅ Perfil docente actualizado correctamente");
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white p-6 flex items-center justify-center">
        <p className="text-blue-100 text-lg animate-pulse">
          Cargando perfil docente...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white p-6 flex flex-col items-center">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-extrabold text-blue-100 mb-8"
      >
        Perfil Docente
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-lg max-w-lg w-full"
      >
        {/* Foto de perfil */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src={docente.foto}
              alt="Foto de perfil"
              className="h-32 w-32 rounded-full object-cover border-4 border-blue-400 shadow-lg"
            />
            {editable && (
              <label
                htmlFor="foto"
                className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow cursor-pointer transition"
              >
                <Camera size={18} />
                <input
                  id="foto"
                  name="foto"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <h2 className="text-xl font-semibold mt-4 text-blue-100">
            {docente.nombre || docente.username || "Docente"}
          </h2>
          <p className="text-blue-300">
            {docente.username ? `Usuario: ${docente.username}` : "Docente del colegio"}
          </p>
        </div>

        {/* Botón editar / guardar */}
        <div className="flex justify-end mb-4">
          {!editable ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditable(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold shadow-md hover:shadow-blue-400/30 transition"
            >
              <Edit3 size={18} /> Editar Perfil
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGuardar}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold shadow-md hover:shadow-green-400/30 transition"
            >
              <Save size={18} /> Guardar Cambios
            </motion.button>
          )}
        </div>

        {/* Formulario */}
        <div className="space-y-5">
          {/* Nombre completo (solo front, no se manda a la API en este ejemplo) */}
          <div>
            <label className="block text-blue-200 font-medium mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              name="nombre"
              value={docente.nombre}
              onChange={handleChange}
              disabled={!editable}
              className={`w-full mt-1 p-2 rounded-md text-blue-900 font-medium ${
                editable
                  ? "bg-white border-2 border-blue-400 focus:ring-2 focus:ring-blue-300"
                  : "bg-white/20 border border-white/20 text-blue-100"
              } outline-none transition`}
            />
          </div>

          {/* Correo */}
          <div>
            <label className="block text-blue-200 font-medium mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={docente.email}
              onChange={handleChange}
              disabled={!editable}
              placeholder="correo@colegio.edu"
              className={`w-full mt-1 p-2 rounded-md ${
                editable
                  ? "bg-white border-2 border-blue-400 text-blue-900 focus:ring-2 focus:ring-blue-300"
                  : "bg-white/20 border border-white/20 text-blue-100"
              } outline-none transition`}
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-blue-200 font-medium mb-1">
              Teléfono
            </label>
            <input
              type="text"
              name="telefono"
              value={docente.telefono}
              onChange={handleChange}
              disabled={!editable}
              className={`w-full mt-1 p-2 rounded-md ${
                editable
                  ? "bg-white border-2 border-blue-400 text-blue-900 focus:ring-2 focus:ring-blue-300"
                  : "bg-white/20 border border-white/20 text-blue-100"
              } outline-none transition`}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
