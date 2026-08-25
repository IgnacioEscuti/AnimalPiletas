import { usoPastillasModel } from "../models/usoPastillas.model.js";

export class UsoPastillasDAO {
  async find(filters) {
    return usoPastillasModel.find(filters);
  }

  async upsertPorClienteYFecha(cliente, weekStart, fecha, data) {
    return usoPastillasModel.findOneAndUpdate(
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
