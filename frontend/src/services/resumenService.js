import { api } from "./api.js";

export const getResumen = async (tipo, fecha) => {
  const { data } = await api.get("/resumen", { params: { tipo, fecha } });
  return data;
};
