import { ClienteDAO } from "../DAOs/cliente.dao.js";

const clienteDAO = new ClienteDAO();

export class ClienteRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async create(data) {
    return this.dao.create(data);
  }

  async findActivos(filtro) {
    return this.dao.findActivos(filtro);
  }

  async findOne(filtros) {
    return this.dao.findOne(filtros);
  }

  async findById(id) {
    return this.dao.findById(id);
  }

  async findByIdAndUpdate(id, data) {
    return this.dao.findByIdAndUpdate(id, data);
  }

  async findSoloNombre(filtro) {
    return this.dao.findSoloNombre(filtro);
  }

  async actualizarOrdenes(operaciones) {
    return this.dao.actualizarOrdenes(operaciones);
  }
}

export const clienteRepository = new ClienteRepository(clienteDAO);
