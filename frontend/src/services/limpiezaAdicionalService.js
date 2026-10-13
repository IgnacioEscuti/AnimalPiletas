import { api } from "./api.js";

export const getLimpiezasAdicionales = async () => {
  const { data } = await api.get("/limpiezas-adicionales");
  return data.limpiezasAdicionales;
};

export const registrarLimpiezaAdicional = async (adicional) => {
  const { data } = await api.post("/limpiezas-adicionales", adicional);
  return data.limpiezaAdicional;
};

export const eliminarLimpiezaAdicional = async (id) => {
  await api.delete(`/limpiezas-adicionales/${id}`);
};
