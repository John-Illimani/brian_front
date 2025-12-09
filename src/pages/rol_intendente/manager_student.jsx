import React, { useState } from "react";

export const GestionEstudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([
    { id: 1, nombre: "Juan Pérez", paralelo: "A" },
    { id: 2, nombre: "María López", paralelo: "B" },
    { id: 3, nombre: "Carlos Díaz", paralelo: "A" },
  ]);

  const [nuevoEstudiante, setNuevoEstudiante] = useState({
    nombre: "",
    paralelo: "",
  });

  const handleAgregar = () => {
    if (!nuevoEstudiante.nombre || !nuevoEstudiante.paralelo) return;
    setEstudiantes([
      ...estudiantes,
      { id: estudiantes.length + 1, ...nuevoEstudiante },
    ]);
    setNuevoEstudiante({ nombre: "", paralelo: "" });
  };

  const handleEliminar = (id) => {
    setEstudiantes(estudiantes.filter((e) => e.id !== id));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow rounded-xl space-y-6">
      <h1 className="text-2xl font-bold text-purple-700">
        Gestión de Estudiantes
      </h1>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nombre"
          value={nuevoEstudiante.nombre}
          onChange={(e) =>
            setNuevoEstudiante({ ...nuevoEstudiante, nombre: e.target.value })
          }
          className="p-2 border rounded w-full"
        />
        <input
          type="text"
          placeholder="Paralelo"
          value={nuevoEstudiante.paralelo}
          onChange={(e) =>
            setNuevoEstudiante({ ...nuevoEstudiante, paralelo: e.target.value })
          }
          className="p-2 border rounded w-32"
        />
        <button
          onClick={handleAgregar}
          className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 transition"
        >
          Agregar
        </button>
      </div>

      <table className="min-w-full bg-white rounded-lg shadow overflow-x-auto">
        <thead className="bg-purple-200 text-purple-800">
          <tr>
            <th className="py-3 px-6 text-left">Nombre</th>
            <th className="py-3 px-6 text-left">Paralelo</th>
            <th className="py-3 px-6 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {estudiantes.map((e) => (
            <tr key={e.id} className="bg-purple-50">
              <td className="py-3 px-6">{e.nombre}</td>
              <td className="py-3 px-6">{e.paralelo}</td>
              <td className="py-3 px-6">
                <button
                  onClick={() => handleEliminar(e.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
