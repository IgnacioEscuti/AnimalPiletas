import { api } from "./api.js";

export const getTarifas = async () => {
  const { data } = await api.get("/tarifas-limpieza");
  return data.tarifas;
};

export const actualizarTarifa = async (id, precio) => {
  const { data } = await api.put(`/tarifas-limpieza/${id}`, { precio });
  return data.tarifa;
};
