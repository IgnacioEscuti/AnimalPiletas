import { limpiezaAdicionalModel } from "../models/limpiezaAdicional.model.js";

export class LimpiezaAdicionalDAO {
  async find(filters) {
    return limpiezaAdicionalModel
      .find(filters)
      .sort({ fecha: 1, createdAt: 1 })
      .populate("cargadoPor", "nombre email");
  }

  async findById(id) {
    return limpiezaAdicionalModel.findById(id);
  }

  async crear(data) {
    const adicional = await limpiezaAdicionalModel.create(data);
    return adicional.populate("cargadoPor", "nombre email");
  }

  async eliminarPorId(id) {
    return limpiezaAdicionalModel.findByIdAndDelete(id);
  }
}
