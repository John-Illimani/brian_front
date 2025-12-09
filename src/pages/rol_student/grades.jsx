import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Importar las funciones de las APIs
import { getUsuarios } from "../../api/api.usuario";
import {
  getEstudiantes,
  getEstudiantesGeneral,
} from "../../api/api.estudiante";

export const Calificaciones = () => {
  const [usuario, setUsuario] = useState([]);
  const [calificacionesGenerales, setCalificacionesGenerales] = useState([]);
  const [estudiante, setEstudiante] = useState([]);
  const [materiasCalificaciones, setMateriasCalificaciones] = useState([]);
  // const [loading, setLoading] = useState(true);

  // Generar boletín
  const generarBoletin = () => {
    if (!usuarioStudent) {
      alert("No se encontraron datos del estudiante.");
      return;
    }

    if (!calificaciones || calificaciones.length === 0) {
      alert("No hay calificaciones para generar el boletín.");
      return;
    }

    const doc = new jsPDF();

    // Título
    doc.setFontSize(16);
    doc.text("Boletín de Calificaciones", 105, 15, { align: "center" });

    // Datos del estudiante
    doc.setFontSize(12);
    doc.text(
      `Estudiante: ${usuarioStudent.nombre} ${usuarioStudent.apellido}`,
      14,
      30
    );
    doc.text(`Usuario: ${usuarioStudent.username}`, 14, 37);
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-BO")}`, 14, 44);

    // Tabla de calificaciones
    const columns = ["Materia", "Trim. 1", "Trim. 2", "Trim. 3", "Final"];

    const rows = calificaciones.map((item) => [
      item.materia,
      item.primer_trimestre ?? "",
      item.segundo_trimestre ?? "",
      item.tercer_trimestre ?? "",
      item.total ?? "",
    ]);

    autoTable(doc, {
      startY: 52,
      head: [columns],
      body: rows,
    });

    // Guardar PDF
    const fileName = `boletin-${usuarioStudent.nombre}-${usuarioStudent.apellido}.pdf`;
    doc.save(fileName);
  };

  useEffect(() => {
    const getValues = async () => {
      try {
        const [
          responseUsuarios,
          responseCalificacionesGenerales,
          responseStudent,
        ] = await Promise.all([
          getUsuarios(),
          getEstudiantesGeneral(),
          getEstudiantes(),
        ]);
        setUsuario(responseUsuarios.data);
        setCalificacionesGenerales(responseCalificacionesGenerales);
        setEstudiante(responseStudent);
      } catch (error) {
        console.error("error al traer los datos ", error);
        throw error;
      }
    };
    getValues();
  }, []);

  // para sacar las calificaciones

  const usuarioStudent = usuario.find(
    (u) => u.username == localStorage.getItem("username")
  );
  const usuarioId = usuarioStudent?.usuario_id;

  const estudianteId = estudiante.find(
    (std) => std.usuario_id == usuarioId
  )?.estudiante_id;

  // para sacar las calificaciones

  const calificaciones = calificacionesGenerales.filter(
    (calificaciones) => calificaciones.estudiante_id == estudianteId
  );

  // if (loading) {
  //   return (
  //     <p className="text-center text-white mt-10">Cargando calificaciones...</p>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-white/15 to-blue-950 text-white p-6 shadow-lg">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-extrabold text-blue-100 mb-4 md:mb-0 uppercase "
        >
          HOLA {usuarioStudent?.nombre ?? ""} {usuarioStudent?.apellido ?? ""}{" "}
          ESTAS SON TUS CALIFICACIONES
        </motion.h1>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generarBoletin}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2 rounded-lg shadow-md hover:shadow-blue-400/40 transition-all duration-300 font-semibold"
        >
          <FileDown size={18} />
          GENERAR BOLETÍN
        </motion.button>
      </div>

      {/* Tabla de calificaciones */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="overflow-x-auto"
      >
        <table className="min-w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg overflow-hidden text-blue-50">
          <thead className="bg-blue-700/50 text-blue-100 uppercase text-sm tracking-wide">
            <tr>
              <th className="py-3 px-6 text-left">Materia</th>
              <th className="py-3 px-6 text-center">Trimestre 1</th>
              <th className="py-3 px-6 text-center">Trimestre 2</th>
              <th className="py-3 px-6 text-center">Trimestre 3</th>
              <th className="py-3 px-6 text-center">Calificación Final</th>
            </tr>
          </thead>

          <tbody>
            {calificaciones.length > 0 ? (
              calificaciones.map((item, index) => (
                <motion.tr
                  key={item.calificacion_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.4 }}
                  className={`${
                    index % 2 === 0 ? "bg-blue-800/40" : "bg-blue-700/40"
                  } hover:bg-blue-600/40 transition-all duration-200`}
                >
                  <td className="py-3 px-6 font-medium">{item.materia}</td>
                  <td className="py-3 px-6 text-center">
                    {item.primer_trimestre}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {item.segundo_trimestre}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {item.tercer_trimestre}
                  </td>
                  <td className="py-3 px-6 text-center">{item.total}</td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-blue-200">
                  No hay calificaciones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};
