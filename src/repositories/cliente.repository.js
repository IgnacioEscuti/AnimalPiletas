import { ClienteDAO } from "../DAOs/cliente.dao.js";

const clienteDAO = new ClienteDAO();

export class ClienteRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async create(data) {
    return this.dao.create(data);
  }

  async find(filtro) {
    return this.dao.find(filtro);
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
}

export const clienteRepository = new ClienteRepository(clienteDAO);
