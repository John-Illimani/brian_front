import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Upload, UserPlus, FileText } from "lucide-react";
import {
  createEstudiante,
  getEstudiantes,
  getEstudiantesGeneral,
} from "../../api/api.estudiante";
import { Formik } from "formik";
import { getMaterias } from "../../api/api.materia";
import { getParalelos } from "../../api/api.paralelos";
import { createUsuario, getUsuarios } from "../../api/api.usuario";
import { createCalificacione } from "../../api/api.calificaciones";

import * as XLSX from "xlsx";

// ---------- HELPERS NOMBRE / USERNAME ----------
function splitNombreApellido(nombreCompleto) {
  const parts = String(nombreCompleto || "").trim().split(" ").filter(Boolean);

  if (parts.length === 1) {
    return { apellido: parts[0], nombre: parts[0] };
  }
  if (parts.length === 2) {
    return { apellido: parts[0], nombre: parts[1] };
  }
  const apellido = parts.slice(0, 2).join(" ");
  const nombre = parts.slice(2).join(" ");
  return { apellido, nombre };
}

function slug(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

// ---------- LECTOR DE EXCEL: SOLO N°, NOMBRES + NOTAS ----------
/**
 * Lee el Excel y devuelve solo:
 *  - N° (para cortar)
 *  - APELLIDOS Y NOMBRES
 *  - 1 TRIM
 *  - 2TRIM
 *  - 3 TRIM
 *  - ANUAL (si existe)
 *
 * Devuelve: [{ nombreCompleto, trim1, trim2, trim3, anual }, ...]
 */
async function leerAlumnosDesdeExcel(file) {
  if (!(file instanceof File)) {
    throw new Error("leerAlumnosDesdeExcel: el parámetro no es un File válido.");
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  if (!rows || rows.length === 0) {
    throw new Error("El Excel está vacío o no se pudo leer.");
  }

  const normalize = (v) =>
    String(v || "").trim().toUpperCase().replace(/\s+/g, "");

  const targets = {
    numero: ["N°", "Nº", "NRO", "NUMERO", "NO"].map((t) =>
      t.replace(/\s+/g, "")
    ),
    nombre: "APELLIDOSYNOMBRES",
    t1: "1TRIM",
    t2: "2TRIM",
    t3: "3TRIM",
    anual: "ANUAL",
  };

  let headerRowIndex = -1;
  const colIndex = {
    numero: -1,
    nombre: -1,
    t1: -1,
    t2: -1,
    t3: -1,
    anual: -1,
  };

  const maxHeaderScan = Math.min(rows.length, 20);

  for (let r = 0; r < maxHeaderScan; r++) {
    const row = rows[r] || [];
    row.forEach((cell, c) => {
      const cellNorm = normalize(cell);

      if (
        colIndex.numero === -1 &&
        targets.numero.some((t) => cellNorm === t)
      ) {
        colIndex.numero = c;
      }

      if (cellNorm === targets.nombre) colIndex.nombre = c;
      if (cellNorm === targets.t1) colIndex.t1 = c;
      if (cellNorm === targets.t2) colIndex.t2 = c;
      if (cellNorm === targets.t3) colIndex.t3 = c;
      if (cellNorm === targets.anual) colIndex.anual = c;
    });

    if (
      colIndex.nombre !== -1 &&
      colIndex.t1 !== -1 &&
      colIndex.t2 !== -1 &&
      colIndex.t3 !== -1
    ) {
      headerRowIndex = r;
    }

    if (headerRowIndex !== -1 && colIndex.numero !== -1) break;
  }

  if (headerRowIndex === -1) {
    throw new Error(
      "No se encontraron las columnas necesarias (APELLIDOS Y NOMBRES, 1TRIM, 2TRIM, 3TRIM). Revisa las cabeceras del Excel."
    );
  }

  const alumnos = [];
  let started = false;

  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const row = rows[r] || [];

    if (colIndex.numero !== -1) {
      const valorNumero = row[colIndex.numero];

      const esVacio =
        valorNumero === undefined || valorNumero === null || valorNumero === "";

      const esNumeroValido =
        !esVacio && !Number.isNaN(Number(String(valorNumero).trim()));

      if (!started) {
        if (!esNumeroValido) {
          continue;
        }
        started = true;
      } else {
        if (!esNumeroValido) {
          break;
        }
      }
    }

    const nombreCompleto = row[colIndex.nombre];
    if (!nombreCompleto || String(nombreCompleto).trim() === "") continue;

    const trim1 = row[colIndex.t1];
    const trim2 = row[colIndex.t2];
    const trim3 = row[colIndex.t3];
    const anual =
      colIndex.anual !== -1 ? row[colIndex.anual] : undefined;

    alumnos.push({
      nombreCompleto: String(nombreCompleto).trim(),
      trim1: trim1 !== undefined && trim1 !== null ? Number(trim1) : 0,
      trim2: trim2 !== undefined && trim2 !== null ? Number(trim2) : 0,
      trim3: trim3 !== undefined && trim3 !== null ? Number(trim3) : 0,
      anual:
        anual !== undefined && anual !== null && anual !== ""
          ? Number(anual)
          : 0,
    });
  }

  console.log("DEBUG alumnos desde Excel:", alumnos);
  return alumnos;
}

export const RegistroEstudiantes = () => {
  const [mensaje, setMensaje] = useState("");
  const [studentsList, setStudentsList] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [paralelos, setParalelos] = useState([]);

  const [pdfParalelo, setPdfParalelo] = useState("");
  const [pdfMateria, setPdfMateria] = useState("");

  const [pdfMode, setPdfMode] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalSuccess, setModalSuccess] = useState(false);

  const [usuario] = useState({
    username: "",
    password: "",
    rol: "",
    nombre: "",
    apellido: "",
    fecha_creacion: "",
    paralelo: "",
    materias: "",
    trimestre1: "",
    trimestre2: "",
    trimestre3: "",
    Anual: "",
  });

  useEffect(() => {
    async function getValues() {
      const [responseEstudiantesGeneral, responseMaterias, responseParalelos] =
        await Promise.all([
          getEstudiantesGeneral(),
          getMaterias(),
          getParalelos(),
        ]);
      setStudentsList(responseEstudiantesGeneral);
      setMaterias(responseMaterias);
      setParalelos(responseParalelos);
    }
    getValues();
  }, []);

  async function getIdUser(username) {
    const response = await getUsuarios();
    return response.data.find((u) => u.username === username)?.usuario_id;
  }

  async function getIdStudent(idUser) {
    const response = await getEstudiantes();
    return response.find((e) => e.usuario_id === idUser)?.estudiante_id;
  }

  async function recargarEstudiantes() {
    const responseEstudiantesGeneral = await getEstudiantesGeneral();
    setStudentsList(responseEstudiantesGeneral);
  }

  // ---------- REGISTRO MANUAL ----------
  const Envio = async (values, { resetForm }) => {
    try {
      // obtener usuarios existentes para evitar duplicados
      const usuariosResp = await getUsuarios();
      const usedUsernames = new Set(
        usuariosResp.data.map((u) => String(u.username))
      );

      // generar username con la misma lógica que el Excel
      const primerNombre = String(values.nombre || "")
        .trim()
        .split(" ")[0] || "";
      const primerApellido = String(values.apellido || "")
        .trim()
        .split(" ")[0] || "";

      let baseUsername = slug(`${primerNombre}${primerApellido}`);
      if (!baseUsername) {
        baseUsername =
          slug(`${values.nombre}${values.apellido}`) || "usermanual";
      }

      let username = baseUsername;
      let contador = 1;
      while (usedUsernames.has(username)) {
        username = `${baseUsername}${contador}`;
        contador++;
      }
      usedUsernames.add(username);

      const password = username; // misma contraseña que en la carga masiva

      const payloadUser = {
        username,
        password,
        rol: "estudiante",
        nombre: values.nombre,
        apellido: values.apellido,
        fecha_creacion: new Date(),
      };

      await createUsuario(payloadUser);

      const idUser = await getIdUser(username);
      const payloadEstudiante = {
        usuario_id: idUser,
        paralelo_id: parseInt(values.paralelo, 10),
      };

      await createEstudiante(payloadEstudiante);

      const idStudent = await getIdStudent(idUser);
      const payloadCalificaciones = {
        primer_trimestre: Number(values.trimestre1) || 0,
        segundo_trimestre: Number(values.trimestre2) || 0,
        tercer_trimestre: Number(values.trimestre3) || 0,
        total: Number(values.Anual) || 0,
        materia_id: parseInt(values.materias, 10),
        estudiante_id: idStudent,
      };

      await createCalificacione(payloadCalificaciones);

      await recargarEstudiantes();
      setMensaje(
        `✅ Estudiante registrado correctamente. Usuario generado: ${username}`
      );
      resetForm();
    } catch (error) {
      console.error("Error al enviar:", error);
      setMensaje("❌ Ocurrió un error al registrar al estudiante");
    }
  };

  // ---------- CARGA MASIVA DESDE EXCEL ----------
  async function handleExcelUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!pdfParalelo || !pdfMateria) {
      setModalSuccess(false);
      setModalMessage(
        "Por favor, selecciona un Paralelo y una Materia antes de subir el Excel."
      );
      setModalOpen(true);
      return;
    }

    try {
      setMensaje("Procesando Excel, por favor espera...");

      const alumnos = await leerAlumnosDesdeExcel(file);

      if (!alumnos || alumnos.length === 0) {
        setMensaje("");
        setModalSuccess(false);
        setModalMessage(
          "No se encontraron filas válidas en el Excel. Revisa el formato."
        );
        setModalOpen(true);
        return;
      }

      const usuariosResp = await getUsuarios();
      const usedUsernames = new Set(
        usuariosResp.data.map((u) => String(u.username))
      );

      let registrados = 0;
      let errores = 0;

      for (let i = 0; i < alumnos.length; i++) {
        const item = alumnos[i];
        const { apellido, nombre } = splitNombreApellido(item.nombreCompleto);

        let baseUsername = slug(
          `${nombre.split(" ")[0]}${apellido.split(" ")[0]}`
        );
        if (!baseUsername) {
          baseUsername = slug(item.nombreCompleto) || `user${i + 1}`;
        }

        let username = baseUsername;
        let contador = 1;
        while (usedUsernames.has(username)) {
          username = `${baseUsername}${contador}`;
          contador++;
        }
        usedUsernames.add(username);

        const password = username;

        try {
          const payloadUser = {
            username,
            password,
            rol: "estudiante",
            nombre,
            apellido,
            fecha_creacion: new Date(),
          };
          await createUsuario(payloadUser);

          const idUser = await getIdUser(username);
          if (!idUser) throw new Error("No se pudo obtener el usuario creado");

          const payloadEstudiante = {
            usuario_id: idUser,
            paralelo_id: parseInt(pdfParalelo, 10),
          };
          await createEstudiante(payloadEstudiante);

          const idStudent = await getIdStudent(idUser);
          if (!idStudent)
            throw new Error("No se pudo obtener el estudiante creado");

          const payloadCalificaciones = {
            primer_trimestre: Number(item.trim1) || 0,
            segundo_trimestre: Number(item.trim2) || 0,
            tercer_trimestre: Number(item.trim3) || 0,
            total: Number(item.anual) || 0,
            materia_id: parseInt(pdfMateria, 10),
            estudiante_id: idStudent,
          };

          await createCalificacione(payloadCalificaciones);

          registrados++;
        } catch (err) {
          console.error(
            `Error registrando estudiante desde Excel (${item.nombreCompleto}):`,
            err
          );
          errores++;
        }
      }

      await recargarEstudiantes();
      setMensaje("");

      if (errores === 0) {
        setModalSuccess(true);
        setModalMessage(
          `✅ Proceso exitoso. Se registraron ${registrados} estudiantes desde el Excel.`
        );
      } else if (registrados > 0) {
        setModalSuccess(false);
        setModalMessage(
          `Proceso parcial. Se registraron ${registrados} estudiantes, pero hubo ${errores} errores. Revisa la consola para más detalles.`
        );
      } else {
        setModalSuccess(false);
        setModalMessage(
          "❌ No se pudo registrar ningún estudiante desde el Excel. Revisa la consola para más detalles."
        );
      }

      setModalOpen(true);
    } catch (error) {
      console.error("Error leyendo / procesando el Excel:", error);
      setMensaje("");
      setModalSuccess(false);
      setModalMessage(
        "❌ Ocurrió un error al leer el Excel. Verifica el archivo y el formato."
      );
      setModalOpen(true);
    } finally {
      event.target.value = "";
    }
  }

  const groupedStudents = useMemo(() => {
    const map = new Map();

    studentsList.forEach((s) => {
      const key = `${s.estudiante_id ?? ""}-${s.nombre}-${s.apellido}`;
      if (!map.has(key)) {
        map.set(key, {
          estudiante_id: s.estudiante_id,
          nombre: s.nombre,
          apellido: s.apellido,
          paralelo: s.descripcion,
          materias: [],
        });
      }
      map.get(key).materias.push({
        materia: s.materia,
        primer_trimestre: s.primer_trimestre,
        segundo_trimestre: s.segundo_trimestre,
        tercer_trimestre: s.tercer_trimestre,
        total: s.total,
      });
    });

    return Array.from(map.values());
  }, [studentsList]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white p-6 flex flex-col items-center">
      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center text-gray-800 shadow-xl">
            <h3
              className={`text-lg font-semibold mb-2 ${
                modalSuccess ? "text-green-600" : "text-red-600"
              }`}
            >
              {modalSuccess ? "Operación exitosa" : "Ocurrió un problema"}
            </h3>
            <p className="mb-4">{modalMessage}</p>
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-extrabold text-blue-100 mb-8"
      >
        Registro de Estudiantes
      </motion.h1>

      {/* Selector Excel / Manual */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setPdfMode(true)}
          className={`px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition ${
            pdfMode
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-white/20 hover:bg-white/30"
          }`}
        >
          <FileText size={18} /> Subir desde Excel (centralizador)
        </button>
        <button
          onClick={() => setPdfMode(false)}
          className={`px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition ${
            !pdfMode
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-white/20 hover:bg-white/30"
          }`}
        >
          <UserPlus size={18} /> Registro Manual
        </button>
      </div>

      {/* Mensaje */}
      {mensaje && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-100 text-blue-800 font-medium p-3 rounded-lg shadow mb-4 max-w-lg w-full text-center"
        >
          {mensaje}
        </motion.div>
      )}

      {/* Modo Excel */}
      {pdfMode ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg w-full max-w-lg space-y-4"
        >
          <h2 className="text-lg font-semibold text-blue-100 mb-1">
            Cargar centralizador en Excel
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-200 font-medium mb-1">
                Paralelo
              </label>
              <select
                value={pdfParalelo}
                onChange={(e) => setPdfParalelo(e.target.value)}
                className="w-full p-2 rounded-md bg-white/20 border border-white/20 text-blue-50 focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="">-- Seleccione un Paralelo --</option>
                {paralelos.map((p) => (
                  <option
                    key={p.paralelo_id}
                    value={p.paralelo_id}
                    className="text-black"
                  >
                    {p.descripcion}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-blue-200 font-medium mb-1">
                Materia
              </label>
              <select
                value={pdfMateria}
                onChange={(e) => setPdfMateria(e.target.value)}
                className="w-full p-2 rounded-md bg-white/20 border border-white/20 text-blue-50 focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="">-- Seleccione una Materia --</option>
                {materias.map((m) => (
                  <option
                    key={m.materia_id}
                    value={m.materia_id}
                    className="text-black"
                  >
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-400 rounded-lg cursor-pointer hover:bg-blue-800/20 transition mt-4">
            <Upload size={40} className="text-blue-300 mb-2" />
            <span className="text-blue-200 font-medium">
              Haz clic o arrastra tu archivo Excel aquí
            </span>
            <span className="text-xs text-blue-200/70 mt-1">
              Formato: centralizador anual de notas (.xlsx/.xls)
            </span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              className="hidden"
            />
          </label>
        </motion.div>
      ) : (
        // Registro Manual
        <Formik
          initialValues={usuario}
          enableReinitialize={true}
          onSubmit={Envio}
        >
          {({ handleChange, handleSubmit, values }) => (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg w-full max-w-lg space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-200 font-medium mb-1">
                    Nombre
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    name="nombre"
                    value={values.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Brian ...."
                    className="w-full p-2 rounded-md bg-white/20 border border-white/20 text-blue-50 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-blue-200 font-medium mb-1">
                    Apellido
                  </label>
                  <input
                    id="apellido"
                    type="text"
                    name="apellido"
                    value={values.apellido}
                    onChange={handleChange}
                    required
                    placeholder="Illanes ...."
                    className="w-full p-2 rounded-md bg-white/20 border border-white/20 text-blue-50 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>

                {/* <div>
                  <label className="block text-blue-200 font-medium mb-1">
                    Username (se genera automáticamente)
                  </label>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={values.username}
                    disabled
                    placeholder="Se generará al guardar"
                    className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-blue-200 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-blue-200 font-medium mb-1">
                    Password (igual que el username)
                  </label>
                  <input
                    id="password"
                    type="text"
                    name="password"
                    value={values.password}
                    disabled
                    placeholder="Se generará al guardar"
                    className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-blue-200 cursor-not-allowed"
                  />
                </div> */}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-200 font-medium mb-1">
                    Paralelo
                  </label>
                  <select
                    name="paralelo"
                    id="paralelo"
                    value={values.paralelo}
                    onChange={handleChange}
                    className="w-full p-2 rounded-md bg-white/20 border border-white/20 text-blue-50 focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="" className="text-black">
                      -- Seleccione un Paralelo --
                    </option>
                    {paralelos.map((p) => (
                      <option
                        key={p.paralelo_id}
                        value={p.paralelo_id}
                        className="text-black"
                      >
                        {p.descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-blue-200 font-medium mb-1">
                    Materia
                  </label>
                  <select
                    name="materias"
                    id="materias"
                    value={values.materias}
                    onChange={handleChange}
                    className="w-full p-2 rounded-md bg-white/20 border border-white/20 text-blue-50 focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="">--Seleccione una Materia--</option>
                    {materias.map((m) => (
                      <option
                        key={m.materia_id}
                        value={m.materia_id}
                        className="text-black"
                      >
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["trimestre1", "trimestre2", "trimestre3", "Anual"].map(
                  (field, i) => (
                    <div key={i}>
                      <label className="block text-blue-200 font-medium mb-1 capitalize">
                        {field === "Anual"
                          ? "Anual"
                          : field.replace("trimestre", "Trimestre ")}
                      </label>
                      <input
                        type="number"
                        name={field}
                        value={values[field]}
                        onChange={handleChange}
                        className="w-full p-2 rounded-md bg-white/20 border border-white/20 text-blue-50 focus:ring-2 focus:ring-blue-400 outline-none"
                        placeholder="0-100"
                      />
                    </div>
                  )
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-md shadow-md hover:shadow-blue-400/40 transition-all duration-300"
              >
                Registrar Estudiante
              </motion.button>
            </motion.form>
          )}
        </Formik>
      )}

      {/* Cards de estudiantes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-10 w-full max-w-6xl"
      >
        <h2 className="text-2xl font-semibold text-blue-100 mb-4">
          Estudiantes Registrados
        </h2>

        {groupedStudents.length === 0 ? (
          <p className="text-blue-100/70">
            No hay estudiantes registrados aún.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {groupedStudents.map((est) => (
              <motion.div
                key={est.estudiante_id ?? `${est.nombre}-${est.apellido}`}
                whileHover={{ y: -4, scale: 1.01 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-lg"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-blue-50">
                      {est.nombre} {est.apellido}
                    </h3>
                    <p className="text-sm text-blue-200">
                      Paralelo:{" "}
                      <span className="font-semibold">{est.paralelo}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-3">
                  {est.materias.map((mat, idx) => (
                    <div
                      key={idx}
                      className="bg-blue-900/40 border border-blue-700/40 rounded-xl p-3"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-blue-100">
                          {mat.materia}
                        </span>
                        <span className="text-sm font-bold text-blue-200">
                          Final: {mat.total}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-blue-100/90">
                        <div className="flex flex-col">
                          <span className="opacity-80">Tri. 1</span>
                          <span className="font-semibold">
                            {mat.primer_trimestre}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="opacity-80">Tri. 2</span>
                          <span className="font-semibold">
                            {mat.segundo_trimestre}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="opacity-80">Tri. 3</span>
                          <span className="font-semibold">
                            {mat.tercer_trimestre}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
