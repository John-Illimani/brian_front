import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { motion } from "framer-motion";
import { FileText, Search, Download } from "lucide-react";

import { getCalendarios } from "../../api/api.calendario"; // ajusta la ruta si hace falta

export const CalendarioEscolarEstudiante = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");

  // =========== CARGAR EVENTOS ===========
  const cargarEventos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCalendarios();
      const data = res.data || [];

      const mapeados = data.map((c) => ({
        id: c.calendario_id,
        descripcion: c.descripcion,
        fecha: typeof c.fecha === "string" ? c.fecha.split("T")[0] : "",
      }));

      setEventos(mapeados);
    } catch (err) {
      console.error(err);
      setError("Error al cargar el calendario.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  // =========== FILTRO ===========
  const eventosFiltrados = eventos.filter((e) =>
    e.descripcion.toLowerCase().includes(search.toLowerCase())
  );

  // =========== GENERAR PDF ===========
  const generarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Calendario Escolar", 14, 20);
    doc.setFontSize(12);
    doc.text(`Fecha de reporte: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = ["Descripción", "Fecha"];
    const tableRows = [];

    eventosFiltrados.forEach((e) => {
      tableRows.push([e.descripcion, e.fecha]);
    });

    autoTable(doc, {
      startY: 40,
      head: [tableColumn],
      body: tableRows,
      headStyles: { fillColor: [30, 64, 175] },
      styles: { fontSize: 11 },
    });

    doc.save("calendario_escolar.pdf");
  };

  // =========== UI LOADING / ERROR ===========
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white flex items-center justify-center">
        <p className="text-lg animate-pulse">Cargando calendario...</p>
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

  // =========== UI PRINCIPAL (SOLO LECTURA) ===========
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white p-6 flex flex-col items-center">
      {/* Título */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-extrabold text-blue-100 mb-8 flex items-center gap-2"
      >
        <FileText size={30} className="text-blue-300" />
        Calendario Escolar
      </motion.h1>

      {/* Buscador + Botón PDF */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg mb-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-2/3">
            <Search
              className="absolute left-3 top-2.5 text-blue-300"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar evento por descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md bg-white/20 text-blue-50 border border-white/20 
                         focus:ring-2 focus:ring-blue-400 outline-none placeholder-blue-200"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generarPDF}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2 
                       rounded-md font-semibold shadow-md hover:shadow-blue-400/40 transition-all duration-300"
          >
            <Download size={18} /> Descargar PDF
          </motion.button>
        </div>
      </motion.div>

      {/* Tabla de eventos (sin acciones) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="w-full max-w-5xl overflow-x-auto"
      >
        <table className="min-w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg overflow-hidden">
          <thead className="bg-blue-700/60 text-blue-100 uppercase text-sm">
            <tr>
              <th className="py-3 px-6 text-left font-semibold">Descripción</th>
              <th className="py-3 px-6 text-left font-semibold">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {eventosFiltrados.length > 0 ? (
              eventosFiltrados.map((e, index) => (
                <tr
                  key={e.id}
                  className={`${
                    index % 2 === 0 ? "bg-blue-800/30" : "bg-blue-700/30"
                  } hover:bg-blue-600/40 transition`}
                >
                  <td className="py-3 px-6 text-blue-50">{e.descripcion}</td>
                  <td className="py-3 px-6 text-blue-100">{e.fecha}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={2}
                  className="py-6 text-center text-blue-300 italic"
                >
                  No se encontraron eventos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};
