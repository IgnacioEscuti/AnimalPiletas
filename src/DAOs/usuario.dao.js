import { usuarioModel } from "../models/usuario.model.js";

export class UsuarioDAO {
  async create(data) {
    return usuarioModel.create(data);
  }

  findByEmail(email) {
    return usuarioModel.findOne({ email: email.trim().toLowerCase() });
  }

  async findById(id) {
    return usuarioModel.findById(id);
  }

  async findAll() {
    return usuarioModel.find();
  }
}
