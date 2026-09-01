import { tarifaLimpiezaRepository } from "../repositories/tarifaLimpieza.repository.js";
import { clienteRepository } from "../repositories/cliente.repository.js";
import { handleMongooseError } from "../utils/mongooseError.utils.js";

export class TarifaLimpiezaService {
  constructor(repository) {
    this.repository = repository;
  }

  async getTarifas() {
    return this.repository.find();
  }

  async createTarifa(nombre, precio) {
    if (!nombre?.trim()) {
      const error = new Error("el nombre es obligatorio");
      error.statusCode = 400;
      throw error;
    }

    if (!Number.isFinite(precio) || precio < 0) {
      const error = new Error("el precio no debe ser negativo");
      error.statusCode = 400;
      throw error;
    }

    try {
      return await this.repository.create({ nombre: nombre.trim(), precio });
    } catch (error) {
      handleMongooseError(error);
    }
  }

  async deleteTarifa(id) {
    let enUso;
    try {
      enUso = await clienteRepository.countDocuments({ tarifaLimpieza: id });
    } catch (error) {
      handleMongooseError(error);
    }

    // Los clientes guardan la tarifa por referencia: si se borra igual,
    // quedan apuntando a un documento que ya no existe.
    if (enUso > 0) {
      const error = new Error(`No se puede eliminar: ${enUso} clientes usan esta tarifa`);
      error.statusCode = 409;
      throw error;
    }

    let tarifa;
    try {
      tarifa = await this.repository.findByIdAndDelete(id);
    } catch (error) {
      handleMongooseError(error);
    }

    if (!tarifa) {
      const error = new Error("tarifa no encontrada");
      error.statusCode = 404;
      throw error;
    }

    return tarifa;
  }

  async updatePrecio(id, precio) {
    if (precio < 0) {
      const error = new Error("el precio no debe ser negativo");
      error.statusCode = 400;
      throw error;
    }

    let tarifa;
    try {
      tarifa = await this.repository.findByIdAndUpdate(id, { precio });
    } catch (error) {
      handleMongooseError(error);
    }

    if (!tarifa) {
      const error = new Error("tarifa no encontrada");
      error.statusCode = 404;
      throw error;
    }

    return tarifa;
  }
}

export const tarifaLimpiezaService = new TarifaLimpiezaService(tarifaLimpiezaRepository);
