import { clienteModel } from "../models/cliente.model.js";

export class ClienteDAO {
  async create(data) {
    return clienteModel.create(data);
  }

  // Sin filtro de status — la usa el Resumen, que tiene que seguir
  // mostrando eventos históricos de clientes ya cancelados.
  async find() {
    return clienteModel.find().populate("tarifaLimpieza", "nombre precio");
  }

  // Para la pantalla de Cliente: nunca debe listar cancelados.
  // OJO: filtra con $ne (no con status: "activo") porque los clientes
  // creados antes de que existiera este campo no lo tienen guardado en
  // el documento — Mongo no aplica el default de Mongoose al filtrar,
  // solo al hidratar resultados, así que un filtro de igualdad los
  // dejaría afuera aunque nunca fueron cancelados.
  async findActivos() {
    return clienteModel
      .find({ status: { $ne: "cancelado" } })
      .populate("tarifaLimpieza", "nombre precio");
  }

  async findOne(filtros) {
    return clienteModel.findOne(filtros).populate("tarifaLimpieza", "nombre precio");
  }

  async findById(id) {
    return clienteModel.findById(id).populate("tarifaLimpieza", "nombre precio");
  }

  async findByIdAndUpdate(id, data) {
    return clienteModel
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate("tarifaLimpieza", "nombre precio");
  }
}
