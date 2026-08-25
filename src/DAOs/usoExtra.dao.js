import { usoExtraModel } from "../models/usoExtra.model.js";

export class UsoExtraDAO {
  async find(filters) {
    return usoExtraModel.find(filters);
  }

  async crear(data) {
    return usoExtraModel.create(data);
  }

  async eliminarPorId(id) {
    return usoExtraModel.findByIdAndDelete(id);
  }
}
