import { limpiezaModel } from "../models/limpieza.model.js";

export class LimpiezaDAO {
  async find(filters) {
    return limpiezaModel.find(filters);
  }

  async upsertPorClienteYFecha(cliente, weekStart, fecha, data) {
    return limpiezaModel.findOneAndUpdate(
      { cliente, weekStart },
      { $set: data, $setOnInsert: { fecha, weekStart } },
      {
        returnDocument: 'after',
        runValidators: true,
        upsert: true,
      }
    );
  }
}
