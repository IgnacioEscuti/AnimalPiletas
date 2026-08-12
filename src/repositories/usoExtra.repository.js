import { UsoExtraDAO } from "../DAOs/usoExtra.dao.js";

const usoExtraDAO = new UsoExtraDAO();

export class UsoExtraRepository {
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

export const usoExtraRepository = new UsoExtraRepository(usoExtraDAO);
