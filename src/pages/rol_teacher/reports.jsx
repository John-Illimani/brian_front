import React, { useEffect, useState } from "react";
import { motion, number } from "framer-motion";
import { FileText, Search, Download } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { getEstudiantesGeneral } from "../../api/api.estudiante";

export const ReportesTeacher = () => {
  const [filtro, setFiltro] = useState("");
  const [reportes, setReportes] = useState([]);

  useEffect(() => {
    async function getValues() {
      const response = await getEstudiantesGeneral();
      setReportes(response);
    }
    getValues();
  }, []);

 

  const estudiantesAgrupados = reportes.reduce((acc, reporteActual, index) => {
    const claveEstudiante = `${reporteActual.nombre} ${reporteActual.apellido}`;

    if (!acc[claveEstudiante]) {
      acc[claveEstudiante] = {
        nombre: reporteActual.nombre,
        apellido: reporteActual.apellido,
        materias: [],
        totalGeneral: 0,
      };
    }

    acc[claveEstudiante].materias.push({
      materia: reporteActual.materia,
      total: reporteActual.total,
    });
    let sumaTotal = 0;

    for (let index = 0; index < acc[claveEstudiante].materias.length; index++) {
      const materia = acc[claveEstudiante].materias[index];
      sumaTotal += parseInt(materia.total, 10);
    }

    
    acc[claveEstudiante].totalGeneral = sumaTotal;

    
    

    return acc;
  }, {});

  const estudiantesAgrupadosArray = Object.values(estudiantesAgrupados);
  
  

  // Filtro por estudiante o materia
  const reportesFiltrados = estudiantesAgrupadosArray.filter((r) => {
    const textoFiltro = filtro.toLowerCase();
    const coincideNombre = r.nombre.toLowerCase().includes(textoFiltro);
    const coincideApellido = r.apellido.toLowerCase().includes(textoFiltro);
    const coincideMateria = r.materias.some((mat) =>
      mat.materia.toLowerCase().includes(textoFiltro)
    );
    return coincideNombre || coincideApellido || coincideMateria;
  });

  // Generar PDF
  const handleGenerarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Reporte Académico", 14, 20);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);

    const datosTabla = [];

    reportesFiltrados.forEach((r) => {
      r.materias.forEach((mat) => {
        datosTabla.push([`${r.nombre} ${r.apellido}`, mat.materia, mat.total]);
      });
    });

    doc.autoTable({
      startY: 40,
      head: [["Estudiante", "Materia", "Promedio"]],
      body: datosTabla,
      headStyles: { fillColor: [30, 64, 175] }, // azul institucional
      styles: { fontSize: 11 },
    });

    doc.save("reporte_academico.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white p-6 flex flex-col items-center">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-extrabold text-blue-100 mb-8 flex items-center gap-2"
      >
        <FileText size={30} className="text-blue-300" />
        Reportes Académicos
      </motion.h1>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-2/3">
            <Search
              className="absolute left-3 top-2.5 text-blue-300"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar por estudiante o materia..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md bg-white/20 text-blue-50 border border-white/20 
                         focus:ring-2 focus:ring-blue-400 outline-none placeholder-blue-200"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerarPDF}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2 
                       rounded-md font-semibold shadow-md hover:shadow-blue-400/40 transition-all duration-300"
          >
            <Download size={18} /> Generar PDF
          </motion.button>
        </div>
      </motion.div>

      {/* Tabla de reportes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="w-full max-w-4xl overflow-x-auto"
      >
        <table className="min-w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg overflow-hidden">
          <thead className="bg-blue-700/60 text-blue-100 uppercase text-sm">
            <tr>
              <th className="py-3 px-6 text-center font-semibold">Nombre</th>
              <th className="py-3 px-6 text-center font-semibold">Apellido</th>
              <th className="py-3 px-6 text-center font-semibold">
                Materias y Promedios
              </th>
              <th className="py-3 px-6 text-center font-semibold">
                Promedio General
              </th>
            </tr>
          </thead>
          <tbody>
            {reportesFiltrados.length > 0 ? (
              reportesFiltrados.map((r, index) => {
                const cantidadMaterias = r.materias.length || 1;
                const promedioGeneral =
                  Math.round((r.totalGeneral / cantidadMaterias) * 100) / 100;

                return (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-blue-800/30" : "bg-blue-700/30"
                    } hover:bg-blue-600/40 transition`}
                  >
                    <td className="py-3 px-6 text-blue-50 text-center">
                      {r.nombre}
                    </td>
                    <td className="py-3 px-6 text-blue-50 text-center">
                      {r.apellido}
                    </td>
                    <td className="py-3 px-6 text-blue-50">
                      <div className="space-y-1">
                        {r.materias.map((mat, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center bg-blue-900/40 px-3 py-1 rounded-md"
                          >
                            <span className="text-blue-100 text-sm">
                              {mat.materia}
                            </span>
                            <span
                              className={`text-sm font-semibold ${
                                mat.total >= 85
                                  ? "text-green-400"
                                  : mat.total < 70
                                  ? "text-red-400"
                                  : "text-yellow-300"
                              }`}
                            >
                              {mat.total}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-center font-semibold text-blue-50">
                      {promedioGeneral}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="py-6 text-center text-blue-300 italic"
                >
                  No se encontraron resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};
