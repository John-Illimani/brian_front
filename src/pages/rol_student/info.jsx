import React, { useEffect, useState } from "react";
import { BookOpen, BarChart2, Calendar, User } from "lucide-react";
import { getCalendarios } from "../../api/api.calendario";
import {
  getEstudiantes,
  getEstudiantesGeneral,
} from "../../api/api.estudiante";
import { getUsuarios } from "../../api/api.usuario";
import { div } from "framer-motion/client";

export const InicioStudent = () => {
  // para sacar los datos

  const [generalEstudiantes, setGeneralEstudiantes] = useState([]);
  const [calendario, setCalendario] = useState([]);
  const [usuario, setUsuario] = useState([]);
  const [estudiante, setEstudiante] = useState([]);

  useEffect(() => {
    const getValues = async () => {
      const [
        responseGeneralEstudiantes,
        responseCalendarios,
        responseUsuario,
        responseEstudiante,
      ] = await Promise.all([
        getEstudiantesGeneral(),
        getCalendarios(),
        getUsuarios(),
        getEstudiantes(),
      ]);
      setGeneralEstudiantes(responseGeneralEstudiantes);
      setCalendario(responseCalendarios.data);
      setUsuario(responseUsuario.data);
      setEstudiante(responseEstudiante);
    };

    getValues();
  }, []);

  const resultUserId = usuario.find(
    (u) => u.username === localStorage.getItem("username")
  )?.usuario_id;

  const estudianteId = estudiante.find(
    (e) => e.usuario_id === resultUserId
  )?.estudiante_id;

  const resultMaterias = generalEstudiantes.filter(
    (cantidad) => cantidad.estudiante_id === estudianteId
  )?.length;

  // const estudiantesAgrupados = generalEstudiantes.reduce(
  //   (acumulador, estudianteActual) => {
  //     const estudianteId = estudianteActual.estudiante_id;

  //     if (!acumulador[estudianteId]) {
  //       acumulador[estudianteId] = {
  //         materias: [],
  //         totalGeneral: 0,
  //       };
  //     }

  //     acumulador[estudianteId].materias.push({
  //       materia: estudianteActual.materia,
  //       total: estudianteActual.total,
  //     });

  //     let sumaTotal = 0;
  //     for (
  //       let index = 0;
  //       index < acumulador[estudianteId].materias.length;
  //       index++
  //     ) {
  //       const total = acumulador[estudianteId].materias[index].total;
  //       sumaTotal += total;
  //     }

  //     acumulador[estudianteId].totalGeneral = sumaTotal;
  //     return acumulador;
  //   },
  //   {}
  // );

  // console.log(estudiantesAgrupados);

  // para el promedio general

  const resultFilter = generalEstudiantes.filter(
  (mat) => mat.estudiante_id == estudianteId
);

let promedioGeneral = 0;

if (resultFilter.length > 0) {
  const sumaTotal = resultFilter.reduce((acc, item) => {
    const nota = Number(item.total);
    return acc + (isNaN(nota) ? 0 : nota);
  }, 0);

  promedioGeneral = Math.round(sumaTotal / resultFilter.length);
} else {
  
  promedioGeneral = 0;
}


  const fechaActual = new Date();

  const resultFechasFilter = calendario.filter((fechas) => {
    const eventos = new Date(fechas.fecha);
    return eventos > fechaActual;
  });

  return (
    <div className="p-6 space-y-8">
      {/* Título principal */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-blue-600">
          👋 Bienvenido al Portal Estudiantil
        </h1>
        <p className="text-blue-300 mt-2 text-sm md:text-base">
          Aquí podrás consultar tus calificaciones, perfil y próximos eventos
          del colegio.
        </p>
      </div>
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-100 p-6 rounded-xl shadow flex items-center gap-4">
          <User size={40} className="text-blue-700" />
          <div>
            <p className="text-gray-600">Mi Perfil</p>
            <p className="text-xl font-bold text-blue-800">Estudiante</p>
          </div>
        </div>

        <div className="bg-blue-100 p-6 rounded-xl shadow flex items-center gap-4">
          <BookOpen size={40} className="text-blue-700" />
          <div>
            <p className="text-gray-600">Materias Inscritas</p>
            <p className="text-xl font-bold text-blue-800">{resultMaterias}</p>
          </div>
        </div>

        <div className="bg-blue-100 p-6 rounded-xl shadow flex items-center gap-4">
          <BarChart2 size={40} className="text-blue-700" />
          <div>
            <p className="text-gray-600">Promedio General Anual</p>
            <p className="text-xl font-bold text-blue-800">{promedioGeneral}</p>
          </div>
        </div>

        <div className="bg-blue-100 p-6 rounded-xl shadow flex justify-center gap-14 col-span-3  ">
          <Calendar
            size={40}
            className="text-blue-700 block text-center h-full"
          />
          <div>
            <p className="text-gray-600 ">Próximo Evento</p>
            <div className="text-xl font-bold text-blue-800">
              {resultFechasFilter.map((item, index) => {
                const fecha = new Date(item.fecha).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });

                return (
                  <div key={`${item.calendario_id} -${index}`}>
                    {item.descripcion} — {fecha}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* Sección adicional de bienvenida */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-2xl shadow-lg text-center">
        <h2 className="text-2xl font-semibold mb-2">Tu progreso importa 🎯</h2>
        <p className="text-blue-100 text-sm md:text-base max-w-2xl mx-auto">
          Consulta tus calificaciones, revisa tus asignaturas y mantente al día
          con los eventos escolares. ¡Sigue aprendiendo y alcanzando tus metas
          académicas!
        </p>
      </div>
    </div>
  );
};
