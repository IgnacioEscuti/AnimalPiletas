import { api } from "./api.js";
import { hoyISO } from "../utils/fecha.js";

export const getEmpleadoSemana = async () => {
  const { data } = await api.get("/empleado-semana", { params: { fecha: hoyISO() } });
  return data.empleadosSemana;
};

export const guardarEmpleadoSemana = async (clienteId, nombre) => {
  const { data } = await api.post("/empleado-semana", { clienteId, nombre });
  return data.empleadoSemana;
};
