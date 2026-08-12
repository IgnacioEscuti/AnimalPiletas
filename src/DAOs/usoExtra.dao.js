import { usoExtraModel } from "../models/usoExtra.model.js";

export class UsoExtraDAO {
  async find(filters) {
    return usoExtraModel.find(filters);
  }

  async upsertPorClienteYFecha(cliente, fecha, data) {
    return usoExtraModel.findOneAndUpdate({ cliente, fecha }, data, {
      new: true,
      runValidators: true,
      upsert: true,
    });
  }
}
