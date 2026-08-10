import { api } from "./api.js";
import { hoyISO } from "../utils/fecha.js";

export const getUsosProductoDeHoy = async () => {
  const { data } = await api.get("/usos-producto", { params: { fecha: hoyISO() } });
  return data.usosProducto;
};

export const registrarUsoProducto = async (clienteId, nombreProducto, precioUnitario) => {
  const { data } = await api.post("/usos-producto", { clienteId, nombreProducto, precioUnitario });
  return data.usoProducto;
};
