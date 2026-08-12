import { api } from "./api.js";

export const getClientes = async () => {
  const { data } = await api.get("/clientes");
  return data.clientes;
};

export const crearCliente = async (cliente) => {
  const { data } = await api.post("/clientes", cliente);
  return data.cliente;
};

export const actualizarCliente = async (id, cliente) => {
  const { data } = await api.put(`/clientes/${id}`, cliente);
  return data.cliente;
};

export const cancelarCliente = async (id) => {
  const { data } = await api.put(`/clientes/${id}`, { status: "cancelado" });
  return data.cliente;
};
