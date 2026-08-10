import { limpiezaModel } from "../models/limpieza.model.js";

export class LimpiezaDAO {
  async find(filters) {
    return limpiezaModel.find(filters);
  }

  async upsertPorClienteYFecha(cliente, fecha, data) {
    return limpiezaModel.findOneAndUpdate({ cliente, fecha }, data, {
      new: true,
      runValidators: true,
      upsert: true,
    });
  }
}
