import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarRange, BookOpen, User2 } from "lucide-react";
import { getMateriasConProfesor } from "../../api/api.materia"; // ajusta la ruta si es otra

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const TIME_SLOTS = [
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
];

// Paleta de colores para las tarjetas de materia
const SUBJECT_COLORS = [
  "bg-blue-500/30 border-blue-300/40",
  "bg-emerald-500/30 border-emerald-300/40",
  "bg-amber-500/30 border-amber-300/40",
  "bg-purple-500/30 border-purple-300/40",
  "bg-rose-500/30 border-rose-300/40",
];

export const HorarioStudent = () => {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const res = await getMateriasConProfesor(); // ya devuelve el array según tu servicio
        setMaterias(res || []);
      } catch (err) {
        console.error("Error al obtener materias:", err);
        setError("Ocurrió un error al cargar las materias.");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white flex items-center justify-center">
        <p className="text-lg animate-pulse">Cargando horario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white flex items-center justify-center">
        <div className="bg-white/10 border border-red-400/40 px-6 py-4 rounded-xl">
          <p className="text-red-200 font-semibold mb-1">Error</p>
          <p className="text-red-100 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!materias || materias.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white flex items-center justify-center">
        <div className="bg-white/10 border border-white/20 px-6 py-4 rounded-xl">
          <p className="text-blue-100 text-sm">
            No hay materias registradas para mostrar el horario.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white p-6 flex flex-col items-center">
      {/* Título */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-extrabold text-blue-100 mb-6 flex items-center gap-3"
      >
        <CalendarRange size={30} className="text-blue-300" />
        Horario Semanal
      </motion.h1>

      {/* Resumen */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-2xl shadow-lg mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h2 className="text-lg font-semibold text-blue-100 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-300" />
            Resumen de materias
          </h2>
          <p className="text-blue-200 text-sm mt-1">
            Tus materias se distribuyen en los distintos días y bloques
            horarios.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-900/50 border border-blue-400/40 px-4 py-2 rounded-xl">
          <span className="text-xs text-blue-200">Materias registradas:</span>
          <span className="text-lg font-bold text-blue-100">
            {materias.length}
          </span>
        </div>
      </motion.div>

      {/* Tabla de horario */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="w-full max-w-5xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg overflow-x-auto"
      >
        <table className="min-w-full text-sm">
          <thead className="bg-blue-800/80 text-blue-100 uppercase text-xs tracking-wide">
            <tr>
              <th className="py-3 px-4 text-left font-semibold border-b border-white/20">
                Hora
              </th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="py-3 px-4 text-center font-semibold border-b border-white/20"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot, rowIndex) => (
              <tr
                key={slot}
                className={
                  rowIndex % 2 === 0 ? "bg-blue-900/40" : "bg-blue-900/20"
                }
              >
                {/* Columna de hora */}
                <td className="py-3 px-4 font-semibold text-blue-100 border-r border-white/10">
                  {slot}
                </td>

                {/* Celdas de días */}
                {DAYS.map((day, dayIndex) => {
                  const idx =
                    (rowIndex * DAYS.length + dayIndex) % materias.length;
                  const materia = materias[idx];
                  const colorClasses =
                    SUBJECT_COLORS[idx % SUBJECT_COLORS.length];

                  return (
                    <td
                      key={`${day}-${slot}`}
                      className="py-3 px-3 text-center align-top"
                    >
                      <div
                        className={`w-full border text-left rounded-lg px-2 py-2 min-h-[80px] flex flex-col justify-center gap-1 
                                   hover:bg-opacity-60 hover:shadow-md transition-all duration-200 ${colorClasses}`}
                      >
                        {/* Nombre materia */}
                        <p className="font-semibold text-xs text-white truncate">
                          {materia.nombre}
                        </p>

                        {/* Profesor más destacado */}
                        <div className="flex items-center gap-1 text-[11px] text-blue-50/95 mt-1">
                          <User2 size={13} className="opacity-90" />
                          <span>
                            Profesor:{" "}
                            <span className="font-semibold">
                              {materia.prof_nombre} {materia.prof_apellido}
                            </span>
                          </span>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-4 py-3 border-t border-white/20 bg-blue-900/40">
          <p className="text-[11px] text-blue-200 text-right">
            * La distribución es generada automáticamente a partir de las
            materias registradas. El horario oficial puede variar según la
            planificación del colegio.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
