import { api } from "./api.js";

export const getUsuarios = async () => {
  const { data } = await api.get("/usuarios");
  return data.usuarios;
};

export const getPendientes = async () => {
  const { data } = await api.get("/usuarios/pendientes");
  return data.usuarios;
};

export const aprobarPendiente = async (id) => {
  await api.patch(`/usuarios/pendientes/${id}/aprobar`);
};

export const rechazarPendiente = async (id) => {
  await api.delete(`/usuarios/pendientes/${id}`);
};
