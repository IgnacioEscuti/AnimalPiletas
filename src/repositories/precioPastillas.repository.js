import { PrecioPastillasDAO } from "../DAOs/precioPastillas.dao.js";

const precioPastillasDAO = new PrecioPastillasDAO();

export class PrecioPastillasRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async find() {
    return this.dao.find();
  }

  async findOneAndUpdate(data) {
    return this.dao.findOneAndUpdate(data);
  }
}

export const precioPastillasRepository = new PrecioPastillasRepository(precioPastillasDAO);
