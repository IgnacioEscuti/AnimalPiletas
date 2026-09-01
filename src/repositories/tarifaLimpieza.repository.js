import { TarifaLimpiezaDAO } from "../DAOs/tarifaLimpieza.dao.js";

const tarifaLimpiezaDAO = new TarifaLimpiezaDAO();

export class TarifaLimpiezaRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async create(data) {
    return this.dao.create(data);
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

  async findByIdAndDelete(id) {
    return this.dao.findByIdAndDelete(id);
  }
}

export const tarifaLimpiezaRepository = new TarifaLimpiezaRepository(tarifaLimpiezaDAO);
