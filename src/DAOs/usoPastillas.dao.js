import { usoPastillasModel } from "../models/usoPastillas.model.js";

export class UsoPastillasDAO {
  async find(filters) {
    return usoPastillasModel.find(filters);
  }

  async upsertPorClienteYFecha(cliente, fecha, data) {
    return usoPastillasModel.findOneAndUpdate({ cliente, fecha }, data, {
      new: true,
      runValidators: true,
      upsert: true,
    });
  }
}
