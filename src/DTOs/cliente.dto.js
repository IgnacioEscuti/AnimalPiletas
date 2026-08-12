export class ClienteDTO {
  constructor(cliente) {
    this.id = cliente.id ?? cliente._id;
    this.nombre = cliente.nombre;
    this.direccion = cliente.direccion;
    this.telefono = cliente.telefono;
    this.tarifaLimpieza = cliente.tarifaLimpieza;
    this.semana = cliente.semana;
    this.status = cliente.status;
  }
}
