import axios from "axios";

const API_URL = "https://brian-back-1.onrender.com/paralelo"; // cambia el puerto según tu backend

// ==================== GET: Obtener todos los usuarios ====================
export const getParalelos = async () => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (error) {
    console.error("Error al obtener Paralelos:", error);
    throw error;
  }
};

// ==================== GET: Obtener un Paralelo por ID ====================
export const getParaleloById = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error al obtener Paralelo con ID ${id}:`, error);
    throw error;
  }
};

// ==================== POST: Crear un nuevo Paralelo ====================
export const createParalelo = async (nuevoParalelo) => {
  try {
    const res = await axios.post(API_URL, nuevoParalelo);
    return res.data;
  } catch (error) {
    console.error("Error al crear Paralelo:", error);
    throw error;
  }
};

// ==================== PUT: Actualizar un Paralelo existente ====================
export const updateParalelo = async (id, ParaleloActualizado) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, ParaleloActualizado);
    return res.data;
  } catch (error) {
    console.error(`Error al actualizar Paralelo con ID ${id}:`, error);
    throw error;
  }
};

// ==================== DELETE: Eliminar un Paralelo ====================
export const deleteParalelo = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error al eliminar Paralelo con ID ${id}:`, error);
    throw error;
  }
};
