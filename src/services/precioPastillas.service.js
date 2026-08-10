import { precioPastillasRepository } from "../repositories/precioPastillas.repository.js";
import { handleMongooseError } from "../utils/mongooseError.utils.js";

export class PrecioPastillasService {
  constructor(repository) {
    this.repository = repository;
  }

  async getPrecio() {
    const precioPastillas = await this.repository.find();

    if (!precioPastillas) {
      const error = new Error("todavía no se cargó el precio de pastillas");
      error.statusCode = 404;
      throw error;
    }

    return precioPastillas;
  }

  async updatePrecio(precio) {
    if (precio < 0) {
      const error = new Error("el precio no debe ser negativo");
      error.statusCode = 400;
      throw error;
    }

    try {
      return await this.repository.findOneAndUpdate({ precio });
    } catch (error) {
      handleMongooseError(error);
    }
  }
}

export const precioPastillasService = new PrecioPastillasService(precioPastillasRepository);
