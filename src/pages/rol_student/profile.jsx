import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Edit3, Save, X, Camera, LogIn, CheckCircle } from "lucide-react";
import { getUsuarios } from "../../api/api.usuario";
import {
  getEstudiantes,
  getEstudiantesGeneral,
  updateStudents,
} from "../../api/api.estudiante";

import { Formik } from "formik";
import { SuccessModal } from "./modal";

export const Perfil = () => {
  const [student, setStudent] = useState([]);
  const [general, setGeneral] = useState([]);
  const [estudiante, setestudiante] = useState([]);
  const payloadEstudiante = {
    paralelo_id: 0,
    frase: "",
  };

  const [modal, setModal] = useState(false);
  const [messageModal, setMessageModal] = useState("");
  useEffect(() => {
    async function getValues() {
      const [responseUser, responseGeneralUser, responseEstudiante] =
        await Promise.all([
          getUsuarios(),
          getEstudiantesGeneral(),
          getEstudiantes(),
        ]);
      setStudent(responseUser.data);
      setGeneral(responseGeneralUser);
      setestudiante(responseEstudiante);
    }
    getValues();
  }, []);

  console.log(student);
  console.log(general);
  console.log(estudiante);

  const userId = student.find(
    (e) => e.username == localStorage.getItem("username")
  );

  const estudianteId = estudiante.find(
    (e) => e.usuario_id == userId?.usuario_id
  );

  const frase = estudianteId?.frase;

  payloadEstudiante.frase = frase;
  payloadEstudiante.paralelo_id = estudianteId?.paralelo_id;

  const estudianteData = general.find(
    (g) => g.estudiante_id == estudianteId?.estudiante_id
  );

  const [editable, setEditable] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setStudent({ ...student, foto: imageURL, archivo: file });
    }
  };

  const Envio = async (values) => {
    try {
      console.log("valores para en enviar:  ", values);
      setEditable(false);

      const id = estudianteId?.estudiante_id;
      console.log(id);

      await updateStudents(id, values);
      setModal(true);
      setMessageModal("¡¡¡¡¡ valores actualizados con exito !!!!!");
      console.log("datos actualizados con exito");
    } catch (error) {
      setModal(true);
      setMessageModal(
        "¡ hubo un error al actulizar los datos, vefirique que todo este llenado correctamente !"
      );
      console.error("error al actualizar los datos ", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-white/15 to-blue-950 text-white p-6 flex flex-col items-center">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-extrabold text-blue-100 mb-8"
      >
        Mi Perfil
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-lg max-w-lg w-full"
      >
        {/* Encabezado con foto */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src={"/chado.jpg"}
              alt="Foto de perfil"
              className="h-40 w-40 rounded-full object-cover border-4 border-blue-400 shadow-lg"
            />
            {editable && (
              <label
                htmlFor="fileInput"
                className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer shadow-md transition"
              >
                <Camera size={18} />
                <input
                  id="fileInput"
                  type="file"
                  name="archivo"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          <h2 className="text-xl font-semibold text-blue-100 mt-4">
            {estudianteData?.nombre ?? ""} {estudianteData?.apellido ?? ""}
          </h2>
          <p className="text-blue-300">{estudianteData?.descripcion ?? ""}</p>
        </div>

        {/* Botón editar/cancelar */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setEditable(!editable)}
            className={`flex items-center gap-2 px-3 py-1 rounded-md font-semibold transition ${
              editable
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {editable ? (
              <>
                <X size={16} /> Cancelar
              </>
            ) : (
              <>
                <Edit3 size={16} /> Editar
              </>
            )}
          </button>
        </div>

        {/* Información del perfil */}
        <Formik
          initialValues={payloadEstudiante}
          enableReinitialize={true}
          onSubmit={Envio}
        >
          {({ handleChange, handleSubmit, values }) => (
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label className="block text-blue-200 font-medium">
                    Eslogan
                  </label>
                  <input
                    id="frase"
                    type="text"
                    name="frase"
                    value={values.frase ?? ""}
                    disabled={!editable}
                    onChange={handleChange}
                    className={`w-full mt-1 p-2 rounded-md text-blue-900 ${
                      editable
                        ? "bg-green-300/80 border-2 border-blue-400 focus:ring-2 focus:ring-blue-300 "
                        : "bg-white/20 border border-white/20 text-blue-100"
                    } transition`}
                  />
                </div>
              </div>

              {/* Botón guardar */}
              {editable && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-2 rounded-md shadow-md hover:shadow-blue-400/40 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Guardar Cambios
                </motion.button>
              )}
            </form>
          )}
        </Formik>
      </motion.div>

      <SuccessModal
        open={modal}
        onClose={() => setModal(false)}
        message={messageModal}
      />
    </div>
  );
};
