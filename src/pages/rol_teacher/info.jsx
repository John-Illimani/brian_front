import React, { useEffect, useState } from "react";
import { Users, BookOpen, ClipboardList, Calendar } from "lucide-react";
import { getMateriasUsername } from "../../api/api.materia";
import { getEstudiantes } from "../../api/api.estudiante";
import { getCalendarios } from "../../api/api.calendario";

export const InicioDocente = () => {
  const [countCourses, setCountCourses] = useState(0);
  const [countEstudiantes, setCountEstudiantes] = useState(0);
  const [calendario, setCalendario] = useState([]);

  // info.jsx
  useEffect(() => {
    async function getValues() {
      const [resultCount, resulEstudiantesRaw, resultCalendario] =
        await Promise.all([
          getMateriasUsername(),
          getEstudiantes(),
          getCalendarios(),
        ]);
      const username = localStorage.getItem("username");
      setCountCourses(resultCount.filter((r) => r.username === username));
      setCountEstudiantes(resulEstudiantesRaw.length);
      // para la fecha

      const ahora = new Date();

      const eventosFuturos = resultCalendario.data.filter((r) => {
        const fechaEvento = new Date(r.fecha);
        return fechaEvento > ahora;
      });

      // Guardas SIEMPRE un array en el estado
      setCalendario(eventosFuturos);
    }

    getValues();
  }, []);

  return (
    <div className="p-6 space-y-8">
      {/* Encabezado */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-emerald-600">
          👋 Bienvenido al Panel Docente
        </h1>
        <p className="text-emerald-300 mt-2 text-sm md:text-base">
          Gestiona tus cursos, registra calificaciones y mantente informado de
          los eventos escolares.
        </p>
      </div>

      {/* Tarjetas informativas */}
      <div className="flex flex-wrap gap-6 justify-center">
        <div className="bg-emerald-100 p-6 rounded-xl shadow flex items-center gap-4">
          <BookOpen size={40} className="text-emerald-700" />
          <div>
            <p className="text-gray-600">Materias Asignadas</p>
            <p className="text-xl font-bold text-emerald-800">
              {countCourses.length}
            </p>
          </div>
        </div>

        <div className="bg-emerald-100 p-6 rounded-xl shadow flex items-center gap-4">
          <Users size={40} className="text-emerald-700" />
          <div>
            <p className="text-gray-600">Estudiantes Totales</p>
            <p className="text-xl font-bold text-emerald-800">
              {countEstudiantes}
            </p>
          </div>
        </div>

        <div className="bg-emerald-100 p-6 rounded-xl shadow flex items-center gap-4">
          <Calendar size={40} className="text-emerald-700" />
          <div>
            <p className="text-gray-600">Próximo Evento</p>
            <p className="text-xl font-bold text-emerald-800">
              {calendario.map((evento) => {
                const fecha = new Date(evento.fecha).toLocaleDateString(
                  "es-ES",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                );

                return (
                  <div key={evento.calendario_id}>
                    {evento.descripcion} — {fecha}
                  </div>
                );
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Mensaje motivacional */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-8 rounded-2xl shadow-lg text-center">
        <h2 className="text-2xl font-semibold mb-2">
          Tu labor transforma vidas 🌱
        </h2>
        <p className="text-emerald-100 text-sm md:text-base max-w-2xl mx-auto">
          Gracias por tu compromiso con la educación. Aquí puedes registrar
          calificaciones, revisar reportes y seguir el progreso de tus
          estudiantes. ¡Cada clase es una oportunidad para inspirar!
        </p>
      </div>
    </div>
  );
};
