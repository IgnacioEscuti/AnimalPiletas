import { LimpiezaAdicionalDAO } from "../DAOs/limpiezaAdicional.dao.js";

const limpiezaAdicionalDAO = new LimpiezaAdicionalDAO();

export class LimpiezaAdicionalRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async find(filters) {
    return this.dao.find(filters);
  }

  async findById(id) {
    return this.dao.findById(id);
  }

  async crear(data) {
    return this.dao.crear(data);
  }

  async eliminarPorId(id) {
    return this.dao.eliminarPorId(id);
  }
}

export const limpiezaAdicionalRepository = new LimpiezaAdicionalRepository(limpiezaAdicionalDAO);
