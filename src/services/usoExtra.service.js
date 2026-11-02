import { usoExtraRepository } from "../repositories/usoExtra.repository.js";
import { clienteRepository } from "../repositories/cliente.repository.js";
import { handleMongooseError } from "../utils/mongooseError.utils.js";
import { hoyNormalizado, rangoSemanal } from "../utils/fecha.utils.js";
import { formatearExtra, formatearNombre } from "../utils/formato.utils.js";

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
      return await this.repository.crear({
        cliente: clienteId,
        fecha: hoyNormalizado(),
        nombreExtra: formatearExtra(nombreExtra),
        precioUnitario,
        empleado: formatearNombre(empleado),
      });
    } catch (error) {
      handleMongooseError(error);
    }
  }

  async eliminarUso(id) {
    let eliminado;
    try {
      eliminado = await this.repository.eliminarPorId(id);
    } catch (error) {
      handleMongooseError(error);
    }

    if (!eliminado) {
      const error = new Error("uso extra no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return eliminado;
  }

  async getUsosPorFecha(fecha) {
    const { inicio, fin } = rangoSemanal(fecha);
    return this.repository.find({ fecha: { $gte: inicio, $lt: fin } });
  }
}

export const usoExtraService = new UsoExtraService(usoExtraRepository, clienteRepository);
