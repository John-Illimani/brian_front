import React, { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import { PieChart as PieIcon, BarChart3, Users } from "lucide-react";

import { getCalificacionesMaterias } from "../../api/api.calificaciones";
import { getEstudiantes } from "../../api/api.estudiante";
import { getParalelos } from "../../api/api.paralelos";
import { getUsuarios } from "../../api/api.usuario";

export const Estadisticas = () => {
  const [calificacionesMaterias, setCalificacionesMaterias] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [paralelos, setParalelos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ================== CARGA DE DATOS DESDE LAS APIS ==================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          respUsuarios,
          dataEstudiantes,
          dataParalelos,
          dataCalifMaterias,
        ] = await Promise.all([
          getUsuarios(),            // axios.get -> { data: [...] }
          getEstudiantes(),         // devuelve array
          getParalelos(),           // devuelve array
          getCalificacionesMaterias(), // devuelve array con nombre materia
        ]);

        setUsuarios(respUsuarios.data || []);
        setEstudiantes(dataEstudiantes || []);
        setParalelos(dataParalelos || []);
        setCalificacionesMaterias(dataCalifMaterias || []);
      } catch (err) {
        console.error(err);
        setError("Ocurrió un error al cargar las estadísticas.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ================== PROMEDIO DE NOTAS POR MATERIA ==================
  const notasPorMateria = useMemo(() => {
    if (!calificacionesMaterias.length) return [];

    const mapa = new Map();
    // cada item: { calificacion_id, primer_trimestre, segundo_trimestre, tercer_trimestre, total, materia_id, estudiante_id, nombre }
    calificacionesMaterias.forEach((c) => {
      const materia = c.nombre || "Sin materia";
      const nota = Number(c.total) || 0;

      if (!mapa.has(materia)) {
        mapa.set(materia, { materia, suma: nota, cantidad: 1 });
      } else {
        const prev = mapa.get(materia);
        mapa.set(materia, {
          materia,
          suma: prev.suma + nota,
          cantidad: prev.cantidad + 1,
        });
      }
    });

    return Array.from(mapa.values()).map((m) => ({
      materia: m.materia,
      promedio: Number((m.suma / m.cantidad).toFixed(2)),
    }));
  }, [calificacionesMaterias]);

  // ================== PROMEDIO DE NOTAS POR PARALELO ==================
  const promedioPorParalelo = useMemo(() => {
    if (!calificacionesMaterias.length || !estudiantes.length || !paralelos.length)
      return [];

    const mapEstudianteParalelo = new Map();
    estudiantes.forEach((e) => {
      mapEstudianteParalelo.set(e.estudiante_id, e.paralelo_id);
    });

    const mapParaleloDescripcion = new Map();
    paralelos.forEach((p) => {
      mapParaleloDescripcion.set(p.paralelo_id, p.descripcion);
    });

    const mapa = new Map(); // key: descParalelo -> { paralelo, suma, cantidad }

    calificacionesMaterias.forEach((c) => {
      const paraleloId = mapEstudianteParalelo.get(c.estudiante_id);
      if (!paraleloId) return;

      const desc = mapParaleloDescripcion.get(paraleloId) || `Paralelo ${paraleloId}`;
      const nota = Number(c.total) || 0;

      if (!mapa.has(desc)) {
        mapa.set(desc, { paralelo: desc, suma: nota, cantidad: 1 });
      } else {
        const prev = mapa.get(desc);
        mapa.set(desc, {
          paralelo: desc,
          suma: prev.suma + nota,
          cantidad: prev.cantidad + 1,
        });
      }
    });

    return Array.from(mapa.values()).map((p) => ({
      paralelo: p.paralelo,
      promedio: Number((p.suma / p.cantidad).toFixed(2)),
    }));
  }, [calificacionesMaterias, estudiantes, paralelos]);

  // ================== DISTRIBUCIÓN DE ROLES (USUARIOS) ==================
  const rolesUsuarios = useMemo(() => {
    if (!usuarios.length) return [];

    const conteo = new Map();
    usuarios.forEach((u) => {
      const rol = u.rol || "sin_rol";
      conteo.set(rol, (conteo.get(rol) || 0) + 1);
    });

    return Array.from(conteo.entries()).map(([rol, value]) => ({
      name: rol,
      value,
    }));
  }, [usuarios]);

  const COLORS = ["#2563EB", "#F59E0B", "#10B981", "#EC4899", "#F97316"];

  // ================== ESTADOS DE CARGA / ERROR ==================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white flex items-center justify-center">
        <p className="text-lg animate-pulse">Cargando estadísticas...</p>
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

  // ================== UI ==================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white p-6 flex flex-col items-center space-y-8">
      {/* Título principal */}
      <motion.h1
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-extrabold text-blue-100 flex items-center gap-3"
      >
        <BarChart3 className="text-blue-300" size={30} /> Estadísticas del Colegio
      </motion.h1>

      {/* Gráfico 1: Promedio de notas por materia */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-2xl p-6 w-full max-w-5xl"
      >
        <h2 className="text-xl font-semibold text-blue-100 mb-4 flex items-center gap-2">
          <BarChart3 size={22} className="text-blue-300" /> Promedio de Notas por
          Materia
        </h2>

        {notasPorMateria.length === 0 ? (
          <p className="text-sm text-blue-100 italic">
            No hay datos de calificaciones para mostrar.
          </p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={notasPorMateria}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.2)"
                />
                <XAxis dataKey="materia" stroke="#BFDBFE" />
                <YAxis stroke="#BFDBFE" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(30, 58, 138, 0.8)",
                    borderRadius: "8px",
                    border: "none",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar dataKey="promedio" fill="#3B82F6" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* Gráfico 2: Promedio de notas por paralelo */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-2xl p-6 w-full max-w-5xl"
      >
        <h2 className="text-xl font-semibold text-blue-100 mb-4 flex items-center gap-2">
          <BarChart3 size={22} className="text-emerald-300" /> Promedio de Notas
          por Paralelo
        </h2>

        {promedioPorParalelo.length === 0 ? (
          <p className="text-sm text-blue-100 italic">
            No hay datos suficientes para calcular promedios por paralelo.
          </p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={promedioPorParalelo}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.2)"
                />
                <XAxis dataKey="paralelo" stroke="#BFDBFE" />
                <YAxis stroke="#BFDBFE" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(30, 64, 118, 0.9)",
                    borderRadius: "8px",
                    border: "none",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar dataKey="promedio" fill="#22C55E" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* Gráfico 3: Distribución de usuarios por rol */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-2xl p-6 w-full max-w-5xl"
      >
        <h2 className="text-xl font-semibold text-blue-100 mb-4 flex items-center gap-2">
          <Users size={22} className="text-pink-300" /> Distribución de Usuarios
          por Rol
        </h2>

        {rolesUsuarios.length === 0 ? (
          <p className="text-sm text-blue-100 italic">
            No hay usuarios registrados para mostrar.
          </p>
        ) : (
          <div className="h-80 flex justify-center">
            <ResponsiveContainer width="90%" height="100%">
              <PieChart>
                <Pie
                  data={rolesUsuarios}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {rolesUsuarios.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(30, 58, 138, 0.8)",
                    borderRadius: "8px",
                    border: "none",
                    color: "#fff",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>
    </div>
  );
};
