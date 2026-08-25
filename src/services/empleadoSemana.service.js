import { empleadoSemanaRepository } from "../repositories/empleadoSemana.repository.js";
import { clienteRepository } from "../repositories/cliente.repository.js";
import { handleMongooseError } from "../utils/mongooseError.utils.js";
import { rangoSemanal } from "../utils/fecha.utils.js";

export class EmpleadoSemanaService {
  constructor(repository, clienteRepository) {
    this.repository = repository;
    this.clienteRepository = clienteRepository;
  }

  async registrarEmpleado(clienteId, nombre = "") {
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

    const { inicio: weekStart } = rangoSemanal();

    try {
      return await this.repository.upsertPorClienteYSemana(clienteId, weekStart, nombre);
    } catch (error) {
      handleMongooseError(error);
    }
  }

  async getEmpleadosPorFecha(fecha) {
    const { inicio, fin } = rangoSemanal(fecha);
    return this.repository.find({ weekStart: { $gte: inicio, $lt: fin } });
  }
}

export const empleadoSemanaService = new EmpleadoSemanaService(empleadoSemanaRepository, clienteRepository);
