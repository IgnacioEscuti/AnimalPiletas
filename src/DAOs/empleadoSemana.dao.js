import { empleadoSemanaModel } from "../models/empleadoSemana.model.js";

export class EmpleadoSemanaDAO {
  async find(filters) {
    return empleadoSemanaModel.find(filters);
  }

  async upsertPorClienteYSemana(cliente, weekStart, nombre) {
    return empleadoSemanaModel.findOneAndUpdate(
      { cliente, weekStart },
      { $set: { nombre } },
      {
        returnDocument: "after",
        runValidators: true,
        upsert: true,
      }
    );
  }
}
