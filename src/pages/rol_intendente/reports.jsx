import React, { useEffect, useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { motion } from "framer-motion";
import { FileText, Search, Download, GraduationCap } from "lucide-react";

import { getUsuarios } from "../../api/api.usuario";
import { getParaleloById } from "../../api/api.paralelos";
import { getEstudiantes } from "../../api/api.estudiante";
import { getCalificacionesMaterias } from "../../api/api.calificaciones";

export const ReportesDire = () => {
  const [estudiantesData, setEstudiantesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [filtroEstudiante, setFiltroEstudiante] = useState("");
  const [filtroParalelo, setFiltroParalelo] = useState("");
  const [filtroMateria, setFiltroMateria] = useState("");

  useEffect(() => {
    const getValuesUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const [responseUser, responseEstudiante, responseCalificaciones] =
          await Promise.all([
            getUsuarios(),
            getEstudiantes(),
            getCalificacionesMaterias(),
          ]);

        const users = responseUser.data.filter(
          (u) => u.rol === "estudiante"
        );
        const estudiantes = responseEstudiante;
        const calificaciones = responseCalificaciones;

        const estudianteObj = [];

        for (let i = 0; i < estudiantes.length; i++) {
          const est = estudiantes[i];

          const user = users.find((u) => u.usuario_id === est.usuario_id);
          const nombreUsuario = user?.nombre ?? "";
          const apellidoUsuario = user?.apellido ?? "";

          const estudianteId = est.estudiante_id;

          const resultCalificacionesFiltradas = calificaciones.filter(
            (c) => c.estudiante_id === estudianteId
          );

          const resultParalelo = await getParaleloById(est.paralelo_id);

          estudianteObj.push({
            id: estudianteId,
            nombre: `${nombreUsuario} ${apellidoUsuario}`.trim(),
            paralelo: resultParalelo.descripcion,
            CalificacionesFiltradas: resultCalificacionesFiltradas,
          });
        }

        setEstudiantesData(estudianteObj);
      } catch (err) {
        console.error(err);
        setError("Ocurrió un error al cargar los reportes.");
      } finally {
        setLoading(false);
      }
    };

    getValuesUsers();
  }, []);

  // aplicar filtros sobre las cards
  const estudiantesFiltrados = useMemo(() => {
    const matFilter = filtroMateria.toLowerCase();

    return estudiantesData.filter((est) => {
      const matchEstudiante = est.nombre
        .toLowerCase()
        .includes(filtroEstudiante.toLowerCase());
      const matchParalelo = est.paralelo
        .toLowerCase()
        .includes(filtroParalelo.toLowerCase());

      const matchMateria =
        matFilter === "" ||
        (est.CalificacionesFiltradas || []).some((c) =>
          c.nombre.toLowerCase().includes(matFilter)
        );

      return matchEstudiante && matchParalelo && matchMateria;
    });
  }, [estudiantesData, filtroEstudiante, filtroParalelo, filtroMateria]);

  // Generar PDF (tabla plana: estudiante, paralelo, materia, nota)
 // Generar PDF (reporte escolar de colegio)
const generarPDF = () => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // ==== DATOS DEL COLEGIO (cámbialos a tu gusto) ====
  const nombreColegio = "UNIDAD EDUCATIVA 'AL FINAL LO PONGO'";
  const subtituloColegio = "Reporte Escolar de Calificaciones";
  const gestion = `Gestión ${new Date().getFullYear()}`;
  const fecha = `Fecha: ${new Date().toLocaleDateString()}`;

  // ==== ENCABEZADO ====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(nombreColegio, pageWidth / 2, 15, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(subtituloColegio, pageWidth / 2, 22, { align: "center" });
  doc.text(gestion, pageWidth / 2, 28, { align: "center" });

  doc.setFontSize(10);
  doc.text(fecha, 14, 36); // alineado a la izquierda

  // Pequeña línea separadora
  doc.setLineWidth(0.3);
  doc.line(14, 38, pageWidth - 14, 38);

  // ==== CUERPO: TABLA ====
  const tableRows = [];

  // aplanamos las cards a filas de tabla
  estudiantesFiltrados.forEach((est) => {
    (est.CalificacionesFiltradas || []).forEach((cal) => {
      tableRows.push([
        est.nombre || "",
        est.paralelo || "",
        cal.nombre || "",
        cal.total || "",
      ]);
    });
  });

  if (tableRows.length === 0) {
    // si no hay datos, igual generamos un mensaje
    doc.setFontSize(11);
    doc.text(
      "No existen registros de calificaciones para los filtros aplicados.",
      14,
      48
    );
    doc.save("reporte_escolar.pdf");
    return;
  }

  autoTable(doc,{
    startY: 44,
    head: [["Estudiante", "Paralelo", "Materia", "Nota"]],
    body: tableRows,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [88, 28, 135], // púrpura institucional
      textColor: [255, 255, 255],
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 60 }, // Estudiante
      1: { cellWidth: 25 }, // Paralelo
      2: { cellWidth: 70 }, // Materia
      3: { cellWidth: 20, halign: "center" }, // Nota
    },
  });

  // ==== PIE DE PÁGINA SENCILLO ====
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - 20,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  doc.save("reporte_escolar.pdf");
};


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950 text-white">
        <span className="text-lg animate-pulse">
          Cargando reportes de notas...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950 text-white">
        <div className="bg-white/10 border border-red-400/40 px-6 py-4 rounded-xl">
          <p className="text-red-200 font-semibold mb-1">Error</p>
          <p className="text-red-100 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white p-6 flex flex-col items-center">
      
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-extrabold text-purple-100 mb-6 flex items-center gap-2"
      >
        <FileText size={30} className="text-purple-300" />
        Reportes de Notas
      </motion.h1>

      
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-purple-300"
              size={16}
            />
            <input
              type="text"
              placeholder="Filtrar por estudiante..."
              value={filtroEstudiante}
              onChange={(e) => setFiltroEstudiante(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md bg-white/15 text-purple-50 border border-white/20 
                         focus:ring-2 focus:ring-purple-400 outline-none placeholder-purple-200 text-sm"
            />
          </div>

         
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-purple-300"
              size={16}
            />
            <input
              type="text"
              placeholder="Filtrar por paralelo..."
              value={filtroParalelo}
              onChange={(e) => setFiltroParalelo(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md bg-white/15 text-purple-50 border border-white/20 
                         focus:ring-2 focus:ring-purple-400 outline-none placeholder-purple-200 text-sm"
            />
          </div>

          
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-purple-300"
              size={16}
            />
            <input
              type="text"
              placeholder="Filtrar por materia..."
              value={filtroMateria}
              onChange={(e) => setFiltroMateria(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md bg-white/15 text-purple-50 border border-white/20 
                         focus:ring-2 focus:ring-purple-400 outline-none placeholder-purple-200 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-purple-100">
            Estudiantes encontrados:{" "}
            <span className="font-semibold text-purple-200">
              {estudiantesFiltrados.length}
            </span>
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generarPDF}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white px-5 py-2 
                       rounded-md font-semibold shadow-md hover:shadow-purple-400/40 transition-all duration-300"
          >
            <Download size={18} /> Generar PDF
          </motion.button>
        </div>
      </motion.div>

      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="w-full max-w-5xl"
      >
        {estudiantesFiltrados.length === 0 ? (
          <div className="text-center text-purple-200 italic py-10">
            No se encontraron estudiantes con los filtros aplicados.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {estudiantesFiltrados.map((estudiante) => (
              <motion.div
                key={estudiante.id}
                whileHover={{ y: -4, scale: 1.01 }}
                className="bg-white/10 border border-white/20 rounded-2xl p-4 shadow-md flex flex-col h-full"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="text-purple-300" size={18} />
                    <h2 className="text-sm font-semibold text-purple-50 leading-tight">
                      {estudiante.nombre}
                    </h2>
                  </div>
                  <span className="text-xs bg-purple-700/70 text-purple-100 px-2 py-1 rounded-full">
                    {estudiante.paralelo}
                  </span>
                </div>

                <div className="mt-2">
                  <p className="text-xs text-purple-200 mb-1">
                    Calificaciones:
                  </p>
                  <ul className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {estudiante.CalificacionesFiltradas.length > 0 ? (
                      estudiante.CalificacionesFiltradas.map((cal) => (
                        <li
                          key={cal.calificacion_id}
                          className="flex items-center justify-between bg-white/5 rounded-md px-3 py-2 text-xs"
                        >
                          <span className="text-purple-100 truncate mr-2">
                            {cal.nombre}
                          </span>
                          <span
                            className={`font-semibold ${
                              Number(cal.total) >= 85
                                ? "text-green-400"
                                : Number(cal.total) < 70
                                ? "text-red-400"
                                : "text-yellow-300"
                            }`}
                          >
                            {cal.total}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-purple-200 text-xs italic">
                        Sin calificaciones registradas.
                      </li>
                    )}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
