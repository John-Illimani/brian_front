import React, { useState } from "react";

export const RegistroNotas = () => {
  // Datos de ejemplo
  const [notas, setNotas] = useState([
    { estudiante: "Juan Pérez", materia: "Matemáticas", paralelo: "A", nota: 0 },
    { estudiante: "María López", materia: "Lengua", paralelo: "B", nota: 0 },
    { estudiante: "Carlos Díaz", materia: "Ciencias", paralelo: "A", nota: 0 },
    { estudiante: "Ana Gómez", materia: "Historia", paralelo: "B", nota: 0 },
  ]);

  // Estado de filtros
  const [filtroEstudiante, setFiltroEstudiante] = useState("");
  const [filtroMateria, setFiltroMateria] = useState("");
  const [filtroParalelo, setFiltroParalelo] = useState("");

  // Manejar cambio de nota
  const handleChange = (index, value) => {
    const newNotas = [...notas];
    newNotas[index].nota = Number(value);
    setNotas(newNotas);
  };

  // Guardar notas
  const handleGuardar = () => {
    console.log("Notas registradas:", notas);
    alert("Notas registradas correctamente ✅");
    // Aquí se podría llamar a backend
  };

  // Filtrar notas
  const notasFiltradas = notas.filter((item) => {
    return (
      item.estudiante.toLowerCase().includes(filtroEstudiante.toLowerCase()) &&
      item.materia.toLowerCase().includes(filtroMateria.toLowerCase()) &&
      item.paralelo.toLowerCase().includes(filtroParalelo.toLowerCase())
    );
  });

  // Listas únicas para filtros
  const materias = [...new Set(notas.map((n) => n.materia))];
  const paralelos = [...new Set(notas.map((n) => n.paralelo))];

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow rounded-xl">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Registro de Notas</h1>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Buscar estudiante..."
          value={filtroEstudiante}
          onChange={(e) => setFiltroEstudiante(e.target.value)}
          className="p-2 border rounded w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <select
          value={filtroMateria}
          onChange={(e) => setFiltroMateria(e.target.value)}
          className="p-2 border rounded w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="">Todas las materias</option>
          {materias.map((m, i) => (
            <option key={i} value={m}>{m}</option>
          ))}
        </select>
        <select
          value={filtroParalelo}
          onChange={(e) => setFiltroParalelo(e.target.value)}
          className="p-2 border rounded w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="">Todos los paralelos</option>
          {paralelos.map((p, i) => (
            <option key={i} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Tabla de notas */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow mb-6">
          <thead className="bg-green-200 text-green-800">
            <tr>
              <th className="py-3 px-6 text-left font-medium">Estudiante</th>
              <th className="py-3 px-6 text-left font-medium">Materia</th>
              <th className="py-3 px-6 text-left font-medium">Paralelo</th>
              <th className="py-3 px-6 text-left font-medium">Nota</th>
            </tr>
          </thead>
          <tbody>
            {notasFiltradas.map((item, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-green-50" : "bg-green-100"}
              >
                <td className="py-3 px-6">{item.estudiante}</td>
                <td className="py-3 px-6">{item.materia}</td>
                <td className="py-3 px-6">{item.paralelo}</td>
                <td className="py-3 px-6">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={item.nota}
                    onChange={(e) => handleChange(index, e.target.value)}
                    className="w-20 p-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </td>
              </tr>
            ))}
            {notasFiltradas.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Botón guardar */}
      <button
        onClick={handleGuardar}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition font-semibold"
      >
        Guardar Notas
      </button>
    </div>
  );
};
