import axios from "axios";

const API_URL = "https://brian-back-1.onrender.com/estudiantes"; 

// Obtener todos los estudiantes
export const getEstudiantes = async () => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (error) {
    console.error("Error al obtener estudiantes:", error);
    throw error;
  }
};



export const createEstudiante = async (nuevoEstudiante) => {
    try {
        
        const res = await axios.post(API_URL, nuevoEstudiante); 
        return res.data;
    } catch (error) {
        console.error("Error al crear estudiante:", error);
        throw error;
    }
};

export const getEstudiantesGeneral = async () => {
  try {
    const res = await axios.get("https://brian-back-1.onrender.com/profesoresGeneralEstudiantes");
    return res.data;
  } catch (error) {
    console.error("Error al obtener datos generales del estudiante:", error);
    throw error;
  }
};

// Obtener estudiante por ID
export const getEstudianteById = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error al obtener estudiante con ID ${id}:`, error);
    throw error;
  }
};

export const updateStudents = async (id, updateStudent) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updateStudent);
    return response.data;
  } catch (error) {
    console.error(`error al actualizar los datos del estudiante ${id}`, {
      error,
      payload: updateStudent,
    });
    throw error;
  }
};

export const deleteStudent = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`error al eliminar el estudiante ${id}`,{error});
    throw error;
  }
};
