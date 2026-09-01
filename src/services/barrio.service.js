import { barrioRepository } from "../repositories/barrio.repository.js";
import { clienteRepository } from "../repositories/cliente.repository.js";
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

  async deleteBarrio(id) {
    let enUso;
    try {
      enUso = await clienteRepository.countDocuments({ barrio: id });
    } catch (error) {
      handleMongooseError(error);
    }

    if (enUso > 0) {
      const error = new Error(`No se puede eliminar: ${enUso} clientes están en este barrio`);
      error.statusCode = 409;
      throw error;
    }

    let barrio;
    try {
      barrio = await this.repository.findByIdAndDelete(id);
    } catch (error) {
      handleMongooseError(error);
    }

    if (!barrio) {
      const error = new Error("barrio no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return barrio;
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
