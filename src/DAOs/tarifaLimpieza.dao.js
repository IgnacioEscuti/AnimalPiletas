import { tarifaLimpiezaModel } from "../models/tarifaLimpieza.model.js";

export class TarifaLimpiezaDAO {
  async find() {
    return tarifaLimpiezaModel.find();
  }

  async findById(id) {
    return tarifaLimpiezaModel.findById(id);
  }

  async findByIdAndUpdate(id, data) {
    return tarifaLimpiezaModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }
}
