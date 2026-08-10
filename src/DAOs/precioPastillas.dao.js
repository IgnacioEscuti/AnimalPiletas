import { precioPastillasModel } from "../models/precioPastillas.model.js";

export class PrecioPastillasDAO {
  async find() {
    return precioPastillasModel.findOne();
  }

  async findOneAndUpdate(data) {
    return precioPastillasModel.findOneAndUpdate({}, data, {
      new: true,
      runValidators: true,
      upsert: true,
    });
  }
}
