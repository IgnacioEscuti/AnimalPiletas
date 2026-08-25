import { UsoExtraDAO } from "../DAOs/usoExtra.dao.js";

const usoExtraDAO = new UsoExtraDAO();

export class UsoExtraRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async find(filters) {
    return this.dao.find(filters);
  }

  async crear(data) {
    return this.dao.crear(data);
  }

  async eliminarPorId(id) {
    return this.dao.eliminarPorId(id);
  }
}

export const usoExtraRepository = new UsoExtraRepository(usoExtraDAO);
