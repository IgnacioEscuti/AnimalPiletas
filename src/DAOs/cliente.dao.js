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

  // Sin filtro de status — la usa el Resumen, que tiene que seguir
  // mostrando eventos históricos de clientes ya cancelados.
  // `filtro` permite acotar por encargado cuando quien pide la lista es rol "encargado".
  async find(filtro = {}) {
    return clienteModel
      .find(filtro)
      .populate("tarifaLimpieza", "nombre precio")
      .populate("barrio", "nombre orden")
      .populate("encargado", "nombre email");
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
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate("tarifaLimpieza", "nombre precio")
      .populate("barrio", "nombre orden")
      .populate("encargado", "nombre email");
  }
}
