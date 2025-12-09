import axios from "axios";

const API_URL = "http://localhost:20000/calificaciones"; // cambia el puerto según tu backend

// ==================== GET: Obtener todos los usuarios ====================
export const getCalificaciones = async () => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (error) {
    console.error("Error al obtener Calificaciones:", error);
    throw error;
  }
};

export const getCalificacionesMaterias = async () => {
  try {
    const response = await axios.get(
      `http://localhost:20000/calificacionesMaterias`
    );
    return response.data;
  } catch (error) {
    console.error("error al obtener datos ", error);
    throw error;
  }
};

// ==================== GET: Obtener un Calificacione por ID ====================
export const getCalificacioneById = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error al obtener Calificacione con ID ${id}:`, error);
    throw error;
  }
};

// ==================== POST: Crear un nuevo Calificacione ====================
export const createCalificacione = async (nuevoCalificacione) => {
  try {
    const res = await axios.post(API_URL, nuevoCalificacione);
    return res.data;
  } catch (error) {
    console.error("Error al crear Calificacione:", error);
    throw error;
  }
};

// ==================== PUT: Actualizar un Calificacione existente ====================
export const updateCalificacione = async (id, CalificacioneActualizado) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, CalificacioneActualizado);
    return res.data;
  } catch (error) {
    console.error(`Error al actualizar Calificacione con ID ${id}:`, error);
    throw error;
  }
};

// ==================== DELETE: Eliminar un Calificacione ====================
export const deleteCalificacione = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error al eliminar Calificacione con ID ${id}:`, error);
    throw error;
  }
};
