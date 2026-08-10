import { clienteRepository } from "../repositories/cliente.repository.js";
import { tarifaLimpiezaRepository } from "../repositories/tarifaLimpieza.repository.js";
import { handleMongooseError } from "../utils/mongooseError.utils.js";

export class ClienteService {
  constructor(repository, tarifaLimpiezaRepository) {
    this.repository = repository;
    this.tarifaLimpiezaRepository = tarifaLimpiezaRepository;
  }

  async validarTarifaExiste(tarifaId) {
    let tarifa;
    try {
      tarifa = await this.tarifaLimpiezaRepository.findById(tarifaId);
    } catch (error) {
      handleMongooseError(error);
    }

    if (!tarifa) {
      const error = new Error("la tarifa de limpieza indicada no existe");
      error.statusCode = 400;
      throw error;
    }
  }

  async createCliente(data) {
    await this.validarTarifaExiste(data.tarifaLimpieza);

    try {
      return await this.repository.create(data);
    } catch (error) {
      handleMongooseError(error);
    }
  }

  async getClientes() {
    return this.repository.find();
  }

  async getClienteById(id) {
    let cliente;
    try {
      cliente = await this.repository.findById(id);
    } catch (error) {
      handleMongooseError(error);
    }

    if (!cliente) {
      const error = new Error("cliente no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return cliente;
  }

  async updateCliente(id, data) {
    if (data.tarifaLimpieza) {
      await this.validarTarifaExiste(data.tarifaLimpieza);
    }

    let cliente;
    try {
      cliente = await this.repository.findByIdAndUpdate(id, data);
    } catch (error) {
      handleMongooseError(error);
    }

    if (!cliente) {
      const error = new Error("cliente no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return cliente;
  }
}

export const clienteService = new ClienteService(clienteRepository, tarifaLimpiezaRepository);
