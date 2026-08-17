import { UsuarioDAO } from "../DAOs/usuario.dao.js";

const usuarioDAO = new UsuarioDAO();

export class UsuarioRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async create(data) {
    return this.dao.create(data);
  }

  async findByEmail(email) {
    return this.dao.findByEmail(email).select("+passwordHash");
  }

  async findById(id) {
    return this.dao.findById(id);
  }
}

export const usuarioRepository = new UsuarioRepository(usuarioDAO);
