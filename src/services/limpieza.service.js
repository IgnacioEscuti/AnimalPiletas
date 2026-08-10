import { limpiezaRepository } from "../repositories/limpieza.repository.js";
import { clienteRepository } from "../repositories/cliente.repository.js";
import { handleMongooseError } from "../utils/mongooseError.utils.js";
import { hoyNormalizado, rangoDelDia } from "../utils/fecha.utils.js";

export class LimpiezaService {
  constructor(repository, clienteRepository) {
    this.repository = repository;
    this.clienteRepository = clienteRepository;
  }

  async registrarLimpieza(clienteId, realizada, extra = 0) {
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

    try {
      return await this.repository.upsertPorClienteYFecha(clienteId, hoyNormalizado(), {
        tarifa: cliente.tarifaLimpieza.id ?? cliente.tarifaLimpieza._id,
        precioUnitarioUsado: cliente.tarifaLimpieza.precio,
        extra,
        realizada,
      });
    } catch (error) {
      handleMongooseError(error);
    }
  }

  async getLimpiezasPorFecha(fecha) {
    const { inicio, fin } = rangoDelDia(fecha);
    return this.repository.find({ fecha: { $gte: inicio, $lt: fin } });
  }
}

export const limpiezaService = new LimpiezaService(limpiezaRepository, clienteRepository);
