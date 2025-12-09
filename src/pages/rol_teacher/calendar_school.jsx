import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Edit3, Trash2, Plus } from "lucide-react";

export const CalendarioEscolar = () => {
  const [eventos, setEventos] = useState([
    { id: 1, fecha: "2025-10-10", descripcion: "Reunión de docentes" },
    { id: 2, fecha: "2025-10-15", descripcion: "Entrega de boletines" },
    { id: 3, fecha: "2025-11-01", descripcion: "Fiesta escolar" },
  ]);

  const [nuevoEvento, setNuevoEvento] = useState({ fecha: "", descripcion: "" });
  const [editId, setEditId] = useState(null);

  const handleGuardar = () => {
    if (!nuevoEvento.fecha || !nuevoEvento.descripcion) {
      alert("Por favor completa todos los campos.");
      return;
    }

    if (editId) {
      setEventos(eventos.map((e) => (e.id === editId ? { ...e, ...nuevoEvento } : e)));
      setEditId(null);
    } else {
      setEventos([...eventos, { id: Date.now(), ...nuevoEvento }]);
    }

    setNuevoEvento({ fecha: "", descripcion: "" });
  };

  const handleEditar = (evento) => {
    setEditId(evento.id);
    setNuevoEvento({ fecha: evento.fecha, descripcion: evento.descripcion });
  };

  const handleEliminar = (id) => {
    if (window.confirm("¿Deseas eliminar este evento?")) {
      setEventos(eventos.filter((e) => e.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white p-6 flex flex-col items-center">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-extrabold text-blue-100 mb-8 flex items-center gap-2"
      >
        <CalendarDays size={30} className="text-blue-300" />
        Calendario Escolar
      </motion.h1>

      {/* Formulario Crear / Editar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg mb-8"
      >
        <h2 className="text-xl font-semibold text-blue-100 mb-4">
          {editId ? "Editar Evento" : "Agregar Nuevo Evento"}
        </h2>

        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="date"
            value={nuevoEvento.fecha}
            onChange={(e) => setNuevoEvento({ ...nuevoEvento, fecha: e.target.value })}
            className="w-full md:w-1/3 p-2 rounded-md bg-white/20 text-blue-50 border border-white/20 
                       focus:ring-2 focus:ring-blue-400 outline-none placeholder-blue-300"
          />

          <input
            type="text"
            placeholder="Descripción del evento"
            value={nuevoEvento.descripcion}
            onChange={(e) =>
              setNuevoEvento({ ...nuevoEvento, descripcion: e.target.value })
            }
            className="w-full md:w-2/3 p-2 rounded-md bg-white/20 text-blue-50 border border-white/20 
                       focus:ring-2 focus:ring-blue-400 outline-none placeholder-blue-300"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGuardar}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 
                       text-white font-semibold px-4 py-2 rounded-md shadow-md hover:shadow-blue-400/30 
                       transition-all duration-300"
          >
            <Plus size={18} />
            {editId ? "Actualizar" : "Agregar"}
          </motion.button>
        </div>
      </motion.div>

      {/* Lista de eventos */}
      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="w-full max-w-3xl space-y-4"
      >
        <AnimatePresence>
          {eventos.map((evento) => (
            <motion.li
              key={evento.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="flex justify-between items-center bg-white/10 border border-white/10 p-4 rounded-xl shadow-md hover:bg-white/20 transition-all"
            >
              <div>
                <p className="font-semibold text-blue-100">{evento.fecha}</p>
                <p className="text-blue-200">{evento.descripcion}</p>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEditar(evento)}
                  className="flex items-center gap-1 bg-yellow-500/80 text-white px-3 py-1 rounded-md 
                             hover:bg-yellow-500 transition shadow"
                >
                  <Edit3 size={16} /> Editar
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEliminar(evento.id)}
                  className="flex items-center gap-1 bg-red-500/80 text-white px-3 py-1 rounded-md 
                             hover:bg-red-600 transition shadow"
                >
                  <Trash2 size={16} /> Eliminar
                </motion.button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
};
