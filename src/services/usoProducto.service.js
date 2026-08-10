import { usoProductoRepository } from "../repositories/usoProducto.repository.js";
import { clienteRepository } from "../repositories/cliente.repository.js";
import { handleMongooseError } from "../utils/mongooseError.utils.js";
import { hoyNormalizado, rangoDelDia } from "../utils/fecha.utils.js";

// Normaliza "cloro", "CLORO", "  cloro " -> "Cloro", para que el mismo
// producto agrupe siempre bajo el mismo nombre en el resumen.
function normalizarNombreProducto(nombre) {
  const limpio = nombre.trim();
  return limpio.charAt(0).toUpperCase() + limpio.slice(1).toLowerCase();
}

export class UsoProductoService {
  constructor(repository, clienteRepository) {
    this.repository = repository;
    this.clienteRepository = clienteRepository;
  }

  async registrarUso(clienteId, nombreProducto, precioUnitario) {
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
        nombreProducto: normalizarNombreProducto(nombreProducto),
        precioUnitario,
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

export const usoProductoService = new UsoProductoService(usoProductoRepository, clienteRepository);
