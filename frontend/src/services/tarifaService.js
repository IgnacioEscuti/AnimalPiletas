import { api } from "./api.js";

export const getTarifas = async () => {
  const { data } = await api.get("/tarifas-limpieza");
  return data.tarifas;
};

export const actualizarTarifa = async (id, precio) => {
  const { data } = await api.put(`/tarifas-limpieza/${id}`, { precio });
  return data.tarifa;
};

export const crearTarifa = async (nombre, precio) => {
  const { data } = await api.post("/tarifas-limpieza", { nombre, precio });
  return data.tarifa;
};

export const eliminarTarifa = async (id) => {
  await api.delete(`/tarifas-limpieza/${id}`);
};
