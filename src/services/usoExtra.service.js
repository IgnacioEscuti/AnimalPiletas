import { usoExtraRepository } from "../repositories/usoExtra.repository.js";
import { clienteRepository } from "../repositories/cliente.repository.js";
import { handleMongooseError } from "../utils/mongooseError.utils.js";
import { hoyNormalizado, rangoDelDia } from "../utils/fecha.utils.js";

// Normaliza "cloro", "CLORO", "  cloro " -> "Cloro", para que el mismo
// extra agrupe siempre bajo el mismo nombre en el resumen.
function normalizarNombreExtra(nombre) {
  const limpio = nombre.trim();
  return limpio.charAt(0).toUpperCase() + limpio.slice(1).toLowerCase();
}

export class UsoExtraService {
  constructor(repository, clienteRepository) {
    this.repository = repository;
    this.clienteRepository = clienteRepository;
  }

  async registrarUso(clienteId, nombreExtra, precioUnitario, empleado = "") {
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
        nombreExtra: normalizarNombreExtra(nombreExtra),
        precioUnitario,
        empleado,
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

export const usoExtraService = new UsoExtraService(usoExtraRepository, clienteRepository);
