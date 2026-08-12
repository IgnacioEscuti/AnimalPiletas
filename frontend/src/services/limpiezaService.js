import { api } from "./api.js";
import { hoyISO } from "../utils/fecha.js";

export const getLimpiezasDeHoy = async () => {
  const { data } = await api.get("/limpiezas", { params: { fecha: hoyISO() } });
  return data.limpiezas;
};

export const registrarLimpieza = async (clienteId, realizada, empleado) => {
  const { data } = await api.post("/limpiezas", { clienteId, realizada, empleado });
  return data.limpieza;
};
