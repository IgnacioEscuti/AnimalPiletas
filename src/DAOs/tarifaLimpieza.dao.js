import { tarifaLimpiezaModel } from "../models/tarifaLimpieza.model.js";

export class TarifaLimpiezaDAO {
  async create(data) {
    return tarifaLimpiezaModel.create(data);
  }

  async find() {
    return tarifaLimpiezaModel.find();
  }

  async findById(id) {
    return tarifaLimpiezaModel.findById(id);
  }

  async findByIdAndUpdate(id, data) {
    return tarifaLimpiezaModel.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
  }

  async findByIdAndDelete(id) {
    return tarifaLimpiezaModel.findByIdAndDelete(id);
  }
}
