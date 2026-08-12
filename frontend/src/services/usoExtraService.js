import { api } from "./api.js";
import { hoyISO } from "../utils/fecha.js";

export const getUsosExtraDeHoy = async () => {
  const { data } = await api.get("/usos-extra", { params: { fecha: hoyISO() } });
  return data.usosExtra;
};

export const registrarUsoExtra = async (clienteId, nombreExtra, precioUnitario, empleado) => {
  const { data } = await api.post("/usos-extra", {
    clienteId,
    nombreExtra,
    precioUnitario,
    empleado,
  });
  return data.usoExtra;
};
