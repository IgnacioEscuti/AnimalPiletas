import { barrioModel } from "../models/barrio.model.js";

export class BarrioDAO {
  async create(data) {
    return barrioModel.create(data);
  }

  async find() {
    return barrioModel.find().sort({ orden: 1 });
  }

  async findById(id) {
    return barrioModel.findById(id);
  }

  async countDocuments() {
    return barrioModel.countDocuments();
  }

  async findByIdAndUpdate(id, data) {
    return barrioModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }
}
