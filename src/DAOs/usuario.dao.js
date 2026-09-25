import { usuarioModel } from "../models/usuario.model.js";

export class UsuarioDAO {
  async create(data) {
    return usuarioModel.create(data);
  }

  findByEmail(email) {
    return usuarioModel.findOne({ email: email.trim().toLowerCase() });
  }

  async findById(id) {
    return usuarioModel.findById(id);
  }

  // OJO: filtra con $ne "pendiente" y no con estado: "aprobado" porque los
  // usuarios creados antes de que existiera este campo no lo tienen guardado
  // en el documento — Mongo no aplica el default de Mongoose al filtrar, solo
  // al hidratar resultados, así que un filtro de igualdad los dejaría afuera
  // aunque nunca estuvieron pendientes. Mismo criterio que Cliente.status.
  async findAprobados() {
    return usuarioModel.find({ estado: { $ne: "pendiente" } });
  }

  async findPendientes() {
    return usuarioModel.find({ estado: "pendiente" }).sort({ createdAt: 1 });
  }

  // "pendiente" en el filtro para que dos admins resolviendo la misma
  // solicitud no se pisen: el segundo no encuentra nada y recibe null.
  async aprobarPendiente(id) {
    return usuarioModel.findOneAndUpdate(
      { _id: id, estado: "pendiente" },
      { estado: "aprobado" },
      { returnDocument: "after" }
    );
  }

  async eliminarPendiente(id) {
    return usuarioModel.findOneAndDelete({ _id: id, estado: "pendiente" });
  }
}
