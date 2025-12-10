// src/services/authService.js
import api from "../api/api.user";

const LOGIN_URL = "https://brian-back-1.onrender.com/api/login"; // tu endpoint que devuelve { token, usuario }

export async function login({ username, password }) {
  const { data } = await api.post(LOGIN_URL, { username, password });
  // data = { message, token, usuario }
  localStorage.setItem("access", data.token);
  localStorage.setItem("user", JSON.stringify(data.usuario)); // { id, nombre, rol }
  localStorage.setItem("username",username);
  return data.usuario;
}

export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("user");
}

export function getCurrentUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem("access");
}
