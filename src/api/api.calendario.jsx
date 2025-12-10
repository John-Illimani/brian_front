import React from "react";
import axios from "axios";

const API_URL = "https://brian-back-1.onrender.com/calendario";

export const getCalendarios = async () => {
  try {
    return await axios.get(`${API_URL}`);
  } catch (error) {
    console.error("error al obtener datos ", error);
    throw error;
  }
};
export const createCalendarios = async (calendario) => {
  try {
    return await axios.post(`${API_URL}`, calendario);
  } catch (error) {
    console.error("error al registrar el calendario ", error);
    throw error;
  }
};

export const updateCalendarios = async (id, calendario) => {
  try {
    return await axios.put(`${API_URL}/${id}`, calendario);
  } catch (error) {
    console.error("error al actualizar el calendario ", error);
    throw error;
  }
};

export const deleteCalendarios = async (id) => {
  try {
    return await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error("error al eliminar el calendario ", error);
    throw error;
  }
};
