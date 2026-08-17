import { api } from "./api.js";

export const getUsuarios = async () => {
  const { data } = await api.get("/usuarios");
  return data.usuarios;
};
