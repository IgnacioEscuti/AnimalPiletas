import { barrioRepository } from "../repositories/barrio.repository.js";
import { handleMongooseError } from "../utils/mongooseError.utils.js";

export class BarrioService {
  constructor(repository) {
    this.repository = repository;
  }

  async createBarrio(nombre) {
    const cantidad = await this.repository.countDocuments();

    try {
      return await this.repository.create({ nombre, orden: cantidad });
    } catch (error) {
      handleMongooseError(error);
    }
  }

  async getBarrios() {
    return this.repository.find();
  }

  async reordenar(ids) {
    try {
      await Promise.all(
        ids.map((id, index) => this.repository.findByIdAndUpdate(id, { orden: index }))
      );
    } catch (error) {
      handleMongooseError(error);
    }
  }
}

export const barrioService = new BarrioService(barrioRepository);
