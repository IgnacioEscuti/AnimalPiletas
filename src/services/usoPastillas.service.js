import { usoPastillasRepository } from "../repositories/usoPastillas.repository.js";
import { clienteRepository } from "../repositories/cliente.repository.js";
import { precioPastillasService } from "./precioPastillas.service.js";
import { handleMongooseError } from "../utils/mongooseError.utils.js";
import { hoyNormalizado, rangoDelDia } from "../utils/fecha.utils.js";

export class UsoPastillasService {
  constructor(repository, clienteRepository) {
    this.repository = repository;
    this.clienteRepository = clienteRepository;
  }

  async registrarUso(clienteId, cantidad) {
    let cliente;
    try {
      cliente = await this.clienteRepository.findById(clienteId);
    } catch (error) {
      handleMongooseError(error);
    }

    if (!cliente) {
      const error = new Error("cliente no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const precioPastillas = await precioPastillasService.getPrecio();

    try {
      return await this.repository.upsertPorClienteYFecha(clienteId, hoyNormalizado(), {
        cantidad,
        precioUnitarioUsado: precioPastillas.precio,
      });
    } catch (error) {
      handleMongooseError(error);
    }
  }

  async getUsosPorFecha(fecha) {
    const { inicio, fin } = rangoDelDia(fecha);
    return this.repository.find({ fecha: { $gte: inicio, $lt: fin } });
  }
}

export const usoPastillasService = new UsoPastillasService(usoPastillasRepository, clienteRepository);
