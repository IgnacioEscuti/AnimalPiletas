import { api } from "./api.js";

export const login = async (email, pin) => {
  const { data } = await api.post("/auth/login", { email, pin });
  return data.usuario;
};

export const registrar = async (email, pin) => {
  const { data } = await api.post("/auth/registro", { email, pin });
  return data.usuario;
};

export const logout = async () => {
  await api.post("/auth/logout");
};

export const obtenerUsuarioActual = async (signal) => {
  const { data } = await api.get("/auth/actual", { signal });
  return data.usuario;
};
