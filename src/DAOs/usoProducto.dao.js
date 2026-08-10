import { usoProductoModel } from "../models/usoProducto.model.js";

export class UsoProductoDAO {
  async find(filters) {
    return usoProductoModel.find(filters);
  }

  async upsertPorClienteYFecha(cliente, fecha, data) {
    return usoProductoModel.findOneAndUpdate({ cliente, fecha }, data, {
      new: true,
      runValidators: true,
      upsert: true,
    });
  }
}
