import axios from "axios";

const API_URL = "http://localhost:20000";

// ======== USUARIOS ======== //
export const getUsuarios = async () => {
  return axios.get(`${API_URL}/usuarios`);
};

export const getUsuarioById = async (id) => {
  return axios.get(`${API_URL}/usuarios/${id}`);
};

export const createUsuario = async (nuevoUsuario) => {
  // Ajusta este endpoint si tu backend usa otra ruta
  return axios.post(`${API_URL}/usuarios`, nuevoUsuario);
};

export const updateUsuarioById = async (id, usuarioActualizado) => {
  return axios.put(`${API_URL}/usuarios/${id}`, usuarioActualizado);
};

export const deleteUsuarioById = async (id) => {
  // Si tu backend usa DELETE, mejor:
  // return axios.delete(`${API_URL}/usuarios/${id}`);
  return axios.delete(`${API_URL}/usuarios/${id}`);
};

// ======== CALIFICACIONES ======== //
export const getCalificaciones = async () => {
  return axios.get(`${API_URL}/calificaciones`);
};

export const getCalificacionById = async (id) => {
  return axios.get(`${API_URL}/calificaciones/${id}`);
};
