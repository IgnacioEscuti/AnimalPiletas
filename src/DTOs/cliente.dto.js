export class ClienteDTO {
  constructor(cliente) {
    this.id = cliente.id ?? cliente._id;
    this.nombre = cliente.nombre;
    this.tarifaLimpieza = cliente.tarifaLimpieza;
    this.semana = cliente.semana;
  }
}
