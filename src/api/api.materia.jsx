import axios from "axios";
import { area } from "framer-motion/client";

const API_URL = "http://localhost:20000/materias"; // cambia el puerto según tu backend

// ==================== GET: Obtener todos los usuarios ====================
export const getMaterias = async () => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (error) {
    console.error("Error al obtener Materias:", error);
    throw error;
  }
};


export async function getMateriasUsername (){
  try {
    const response =  await axios.get("http://localhost:20000/materiasUsername");
    return response.data;
  } catch (error) {
    console.error("error al traer datos de la vista del backend ", error);
    throw error;
  }
}


export async function getMateriasConProfesor (){
  try {
    const response =  await axios.get("http://localhost:20000/profesoresMaterias");
    return response.data;
  } catch (error) {
    console.error("error al traer datos de la vista del backend ", error);
    throw error;
  }
}



// ==================== GET: Obtener un Materia por ID ====================
export const getMateriaById = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error al obtener Materia con ID ${id}:`, error);
    throw error;
  }
};

// ==================== POST: Crear un nuevo Materia ====================
export const createMateria = async (nuevoMateria) => {
  try {
    const res = await axios.post(API_URL, nuevoMateria);
    return res.data;
  } catch (error) {
    console.error("Error al crear Materia:", error);
    throw error;
  }
};

// ==================== PUT: Actualizar un Materia existente ====================
export const updateMateria = async (id, MateriaActualizado) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, MateriaActualizado);
    return res.data;
  } catch (error) {
    console.error(`Error al actualizar Materia con ID ${id}:`, error);
    throw error;
  }
};

// ==================== DELETE: Eliminar un Materia ====================
export const deleteMateria = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error al eliminar Materia con ID ${id}:`, error);
    throw error;
  }
};
