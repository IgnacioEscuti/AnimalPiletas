import { UsoPastillasDAO } from "../DAOs/usoPastillas.dao.js";

const usoPastillasDAO = new UsoPastillasDAO();

export class UsoPastillasRepository {
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

export const usoPastillasRepository = new UsoPastillasRepository(usoPastillasDAO);
