export class ClienteBuscadorDTO {
  constructor(cliente) {
    this.id = cliente.id ?? cliente._id;
    this.nombre = cliente.nombre;
    this.barrio = cliente.barrio?.nombre ?? null;
  }
}
