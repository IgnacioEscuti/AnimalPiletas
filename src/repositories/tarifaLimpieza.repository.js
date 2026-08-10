import { TarifaLimpiezaDAO } from "../DAOs/tarifaLimpieza.dao.js";

const tarifaLimpiezaDAO = new TarifaLimpiezaDAO();

export class TarifaLimpiezaRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async find() {
    return this.dao.find();
  }

  async findById(id) {
    return this.dao.findById(id);
  }

  async findByIdAndUpdate(id, data) {
    return this.dao.findByIdAndUpdate(id, data);
  }
}

export const tarifaLimpiezaRepository = new TarifaLimpiezaRepository(tarifaLimpiezaDAO);
