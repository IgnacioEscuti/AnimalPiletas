import { api } from "./api.js";

export const getBarrios = async () => {
  const { data } = await api.get("/barrios");
  return data.barrios;
};

export const crearBarrio = async (nombre) => {
  const { data } = await api.post("/barrios", { nombre });
  return data.barrio;
};

export const reordenarBarrios = async (ids) => {
  await api.put("/barrios/reordenar", { ids });
};

export const eliminarBarrio = async (id) => {
  await api.delete(`/barrios/${id}`);
};
