import { BarrioDAO } from "../DAOs/barrio.dao.js";

const barrioDAO = new BarrioDAO();

export class BarrioRepository {
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

  async countDocuments() {
    return this.dao.countDocuments();
  }

  async findByIdAndUpdate(id, data) {
    return this.dao.findByIdAndUpdate(id, data);
  }
}

export const barrioRepository = new BarrioRepository(barrioDAO);
