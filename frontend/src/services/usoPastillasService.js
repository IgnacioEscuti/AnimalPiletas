import { api } from "./api.js";
import { hoyISO } from "../utils/fecha.js";

export const getUsosPastillasDeHoy = async () => {
  const { data } = await api.get("/usos-pastillas", { params: { fecha: hoyISO() } });
  return data.usosPastillas;
};

export const registrarUsoPastillas = async (clienteId, cantidad) => {
  const { data } = await api.post("/usos-pastillas", { clienteId, cantidad });
  return data.usoPastillas;
};
