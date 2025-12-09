import React, { useEffect, useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { getCalificaciones } from "../../api/api.calificaciones";
import { getEstudiantes } from "../../api/api.estudiante";
import { getUsuarios } from "../../api/api.usuario";
import { getParalelos } from "../../api/api.paralelos";
import { getMaterias } from "../../api/api.materia";

export const Boletines = () => {
  const [estudiantesData, setEstudiantesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filter, setFilter] = useState({
    estudiante: "",
    paralelo: "",
    materia: "",
  });

  // ================== CARGA DE DATOS DESDE LAS APIS ==================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          resUsuarios,
          dataEstudiantes,
          dataParalelos,
          dataMaterias,
          dataCalificaciones,
        ] = await Promise.all([
          getUsuarios(),        // axios.get -> { data: [...] }
          getEstudiantes(),     // [...]
          getParalelos(),       // [...]
          getMaterias(),        // [...]
          getCalificaciones(),  // [...]
        ]);

        const usuarios = (resUsuarios.data || []).filter(
          (u) => u.rol === "estudiante"
        );
        const estudiantes = dataEstudiantes || [];
        const paralelos = dataParalelos || [];
        const materias = dataMaterias || [];
        const calificaciones = dataCalificaciones || [];

        const mapUsuarioById = new Map(
          usuarios.map((u) => [u.usuario_id, u])
        );
        const mapParaleloById = new Map(
          paralelos.map((p) => [p.paralelo_id, p.descripcion])
        );
        const mapMateriaById = new Map(
          materias.map((m) => [m.materia_id, m.nombre])
        );

        // agrupar calificaciones por estudiante
        const mapMateriasPorEst = new Map();
        calificaciones.forEach((c) => {
          const estId = c.estudiante_id;
          const materiaNombre =
            mapMateriaById.get(c.materia_id) || `Materia ${c.materia_id}`;

          const materiaObj = {
            materia: materiaNombre,
            trimestre1: Number(c.primer_trimestre) || 0,
            trimestre2: Number(c.segundo_trimestre) || 0,
            trimestre3: Number(c.tercer_trimestre) || 0,
            total: Number(c.total) || 0,
          };

          if (!mapMateriasPorEst.has(estId)) {
            mapMateriasPorEst.set(estId, [materiaObj]);
          } else {
            mapMateriasPorEst.get(estId).push(materiaObj);
          }
        });

        const resultado = [];

        estudiantes.forEach((est) => {
          const user = mapUsuarioById.get(est.usuario_id);
          if (!user) return; // por si hubiera estudiantes sin usuario de rol "estudiante"

          const materiasEst = mapMateriasPorEst.get(est.estudiante_id) || [];
          if (materiasEst.length === 0) return; // sin notas, no mostramos boletín

          const nombreCompleto = `${user.nombre || ""} ${
            user.apellido || ""
          }`.trim();
          const paraleloDesc =
            mapParaleloById.get(est.paralelo_id) || `Paralelo ${est.paralelo_id}`;

          resultado.push({
            id: est.estudiante_id,
            nombre: nombreCompleto,
            paralelo: paraleloDesc,
            materias: materiasEst,
          });
        });

        setEstudiantesData(resultado);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los boletines.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ================== FILTRADO ==================
  const filteredEstudiantes = useMemo(() => {
    const fEst = filter.estudiante.toLowerCase();
    const fPar = filter.paralelo.toLowerCase();
    const fMat = filter.materia.toLowerCase();

    return estudiantesData
      .filter(
        (e) =>
          e.nombre.toLowerCase().includes(fEst) &&
          e.paralelo.toLowerCase().includes(fPar)
      )
      .map((e) => ({
        ...e,
        materias: e.materias.filter((m) =>
          m.materia.toLowerCase().includes(fMat)
        ),
      }))
      .filter((e) => e.materias.length > 0);
  }, [estudiantesData, filter]);

  // ================== GENERAR PDF POR ESTUDIANTE ==================
  const generarPDF = (estudiante) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Boletín Trimestral - ${estudiante.nombre}`, 14, 16);
    doc.setFontSize(12);
    doc.text(`Paralelo: ${estudiante.paralelo}`, 14, 24);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = [
      "Materia",
      "Trimestre 1",
      "Trimestre 2",
      "Trimestre 3",
      "Promedio",
    ];
    const tableRows = [];

    estudiante.materias.forEach((m) => {
      const promedio = (
        (m.trimestre1 + m.trimestre2 + m.trimestre3) /
        3
      ).toFixed(2);
      tableRows.push([
        m.materia,
        m.trimestre1,
        m.trimestre2,
        m.trimestre3,
        promedio,
      ]);
    });

    autoTable(doc, {
      startY: 36,
      head: [tableColumn],
      body: tableRows,
      styles: { halign: "center" },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [230, 240, 255] },
    });

    // Sello / texto de verificación (placeholder blockchain)
    const finalY = doc.lastAutoTable?.finalY || 36;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      "Verificado por blockchain",
      14,
      finalY + 10
    ); // <- aquí luego conectas la verificación real

    doc.save(`boletin_${estudiante.nombre.replace(/\s+/g, "_")}.pdf`);
  };

  // ================== UI ESTADOS ==================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white flex items-center justify-center">
        <p className="text-lg animate-pulse">Cargando boletines...</p>
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

  // ================== UI PRINCIPAL ==================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-extrabold text-blue-100 mb-6">
        📘 Boletines Trimestrales
      </h1>

      {/* Filtros */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl w-full max-w-4xl mb-6 flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Filtrar por estudiante"
          value={filter.estudiante}
          onChange={(e) =>
            setFilter({ ...filter, estudiante: e.target.value })
          }
          className="p-2 rounded-md bg-white/20 border border-white/20 text-blue-50 placeholder-blue-200 focus:ring-2 focus:ring-blue-400 outline-none flex-1"
        />
        <input
          type="text"
          placeholder="Filtrar por paralelo"
          value={filter.paralelo}
          onChange={(e) =>
            setFilter({ ...filter, paralelo: e.target.value })
          }
          className="p-2 rounded-md bg-white/20 border border-white/20 text-blue-50 placeholder-blue-200 focus:ring-2 focus:ring-blue-400 outline-none w-32"
        />
        <input
          type="text"
          placeholder="Filtrar por materia"
          value={filter.materia}
          onChange={(e) =>
            setFilter({ ...filter, materia: e.target.value })
          }
          className="p-2 rounded-md bg-white/20 border border-white/20 text-blue-50 placeholder-blue-200 focus:ring-2 focus:ring-blue-400 outline-none w-32"
        />
      </div>

      {/* Tabla / cards de boletines */}
      <div className="w-full max-w-5xl space-y-4">
        {filteredEstudiantes.length === 0 && (
          <p className="text-center text-blue-200 italic">
            No se encontraron boletines
          </p>
        )}

        {filteredEstudiantes.map((est) => (
          <div
            key={est.id}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-blue-100">
                  {est.nombre} — {est.paralelo}
                </h2>
                <p className="text-xs text-blue-200 mt-1">
                  Verificado por blockchain {/* etiqueta visible en UI */}
                </p>
              </div>
              <button
                onClick={() => generarPDF(est)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md transition"
              >
                📄 Descargar PDF
              </button>
            </div>

            <table className="min-w-full bg-white/10 border border-white/20 rounded-xl overflow-hidden text-blue-50">
              <thead className="bg-blue-700/70">
                <tr>
                  <th className="py-2 px-4 text-left">Materia</th>
                  <th className="py-2 px-4 text-center">Trimestre 1</th>
                  <th className="py-2 px-4 text-center">Trimestre 2</th>
                  <th className="py-2 px-4 text-center">Trimestre 3</th>
                  <th className="py-2 px-4 text-center">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {est.materias.map((m, index) => {
                  const promedio = (
                    (m.trimestre1 + m.trimestre2 + m.trimestre3) /
                    3
                  ).toFixed(2);
                  return (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0
                          ? "bg-blue-800/30"
                          : "bg-blue-700/30"
                      } hover:bg-blue-600/40 transition`}
                    >
                      <td className="py-2 px-4">{m.materia}</td>
                      <td className="py-2 px-4 text-center">
                        {m.trimestre1}
                      </td>
                      <td className="py-2 px-4 text-center">
                        {m.trimestre2}
                      </td>
                      <td className="py-2 px-4 text-center">
                        {m.trimestre3}
                      </td>
                      <td className="py-2 px-4 text-center font-semibold text-blue-200">
                        {m.total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};
