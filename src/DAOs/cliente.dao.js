import { clienteModel } from "../models/cliente.model.js";

export class ClienteDAO {
  async create(data) {
    return clienteModel.create(data);
  }

  async find() {
    return clienteModel.find().populate("tarifaLimpieza", "nombre precio");
  }

  async findById(id) {
    return clienteModel.findById(id).populate("tarifaLimpieza", "nombre precio");
  }

  async findByIdAndUpdate(id, data) {
    return clienteModel
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate("tarifaLimpieza", "nombre precio");
  }
}
