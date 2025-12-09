// src/services/api.js
import axios from "axios";

// Crea una instancia de Axios con la URL base de tu backend
const api = axios.create({
  baseURL: "http://localhost:20000", // Cambia esto si tu backend usa otro puerto o dominio
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: agrega el token (si existe) a cada petición automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
