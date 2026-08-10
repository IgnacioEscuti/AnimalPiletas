import { LimpiezaDAO } from "../DAOs/limpieza.dao.js";

const limpiezaDAO = new LimpiezaDAO();

export class LimpiezaRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async find(filters) {
    return this.dao.find(filters);
  }

  async upsertPorClienteYFecha(cliente, fecha, data) {
    return this.dao.upsertPorClienteYFecha(cliente, fecha, data);
  }
}

export const limpiezaRepository = new LimpiezaRepository(limpiezaDAO);
