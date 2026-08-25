import { clienteModel } from "../models/cliente.model.js";

export class ClienteDAO {
  async create(data) {
    const cliente = await clienteModel.create(data);
    return cliente.populate([
      { path: "tarifaLimpieza", select: "nombre precio" },
      { path: "barrio", select: "nombre orden" },
      { path: "encargado", select: "nombre email" },
    ]);
  }

  // Para la pantalla de Cliente: nunca debe listar cancelados.
  // OJO: filtra con $ne (no con status: "activo") porque los clientes
  // creados antes de que existiera este campo no lo tienen guardado en
  // el documento — Mongo no aplica el default de Mongoose al filtrar,
  // solo al hidratar resultados, así que un filtro de igualdad los
  // dejaría afuera aunque nunca fueron cancelados.
  async findActivos(filtro = {}) {
    return clienteModel
      .find({ status: { $ne: "cancelado" }, ...filtro })
      .populate("tarifaLimpieza", "nombre precio")
      .populate("barrio", "nombre orden")
      .populate("encargado", "nombre email");
  }

  async findOne(filtros) {
    return clienteModel
      .findOne(filtros)
      .populate("tarifaLimpieza", "nombre precio")
      .populate("barrio", "nombre orden")
      .populate("encargado", "nombre email");
  }

  async findById(id) {
    return clienteModel
      .findById(id)
      .populate("tarifaLimpieza", "nombre precio")
      .populate("barrio", "nombre orden")
      .populate("encargado", "nombre email");
  }

  async findByIdAndUpdate(id, data) {
    return clienteModel
      .findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true })
      .populate("tarifaLimpieza", "nombre precio")
      .populate("barrio", "nombre orden")
      .populate("encargado", "nombre email");
  }

  // Sin populate: para el Resumen, que solo necesita id + nombre del
  // cliente y no tarifa/barrio/encargado.
  async findSoloNombre(filtro = {}) {
    return clienteModel.find(filtro).select("nombre");
  }

  async actualizarOrdenes(operaciones) {
    return clienteModel.bulkWrite(
      operaciones.map(({ id, orden }) => ({
        updateOne: { filter: { _id: id }, update: { ordenEnBarrio: orden } },
      }))
    );
  }
}
