export class ClienteBuscadorDTO {
  constructor(cliente) {
    this.id = cliente.id ?? cliente._id;
    this.nombre = cliente.nombre;
    this.barrio = cliente.barrio?.nombre ?? null;
    this.direccion = cliente.direccion;
    this.telefono = cliente.telefono;
    this.tarifaLimpieza = cliente.tarifaLimpieza && {
      nombre: cliente.tarifaLimpieza.nombre,
      precio: cliente.tarifaLimpieza.precio,
    };
    // Solo el id: el frontend lo compara con el usuario logueado para
    // decidir si muestra "Editar".
    this.encargado = cliente.encargado ?? null;
  }
}
