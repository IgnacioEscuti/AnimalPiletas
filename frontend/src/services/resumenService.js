import { api } from "./api.js";

export const getResumen = async (tipo, fecha, encargadoId) => {
  const params = { tipo, fecha };
  if (encargadoId) params.encargadoId = encargadoId;
  const { data } = await api.get("/resumen", { params });
  return data;
};
