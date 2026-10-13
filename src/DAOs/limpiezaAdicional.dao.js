import { limpiezaAdicionalModel } from "../models/limpiezaAdicional.model.js";

const POPULATE = [
  { path: "cliente", select: "nombre" },
  { path: "cargadoPor", select: "nombre email" },
];

export class LimpiezaAdicionalDAO {
  async find(filters) {
    return limpiezaAdicionalModel.find(filters).sort({ fecha: 1, createdAt: 1 }).populate(POPULATE);
  }

  async findById(id) {
    return limpiezaAdicionalModel.findById(id);
  }

  async crear(data) {
    const adicional = await limpiezaAdicionalModel.create(data);
    return adicional.populate(POPULATE);
  }

  async eliminarPorId(id) {
    return limpiezaAdicionalModel.findByIdAndDelete(id);
  }
}
