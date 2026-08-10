import { api } from "./api.js";

export const getPrecioPastillas = async () => {
  const { data } = await api.get("/precio-pastillas");
  return data.precioPastillas;
};

export const actualizarPrecioPastillas = async (precio) => {
  const { data } = await api.put("/precio-pastillas", { precio });
  return data.precioPastillas;
};
