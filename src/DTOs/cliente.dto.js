export class ClienteDTO {
  constructor(cliente) {
    this.id = cliente.id ?? cliente._id;
    this.nombre = cliente.nombre;
    this.direccion = cliente.direccion;
    this.telefono = cliente.telefono;
    // El populate trae tarifaLimpieza/barrio como subdocumentos de
    // Mongoose: al serializar el objeto entero con res.json(), su
    // toJSON() por defecto excluye el virtual "id" (solo deja "_id"),
    // así que hay que sacarlo a mano igual que se hace con el id del
    // cliente — si no, el modal del frontend (que lee
    // cliente.tarifaLimpieza?.id / .barrio?.id para preseleccionar el
    // <select>) siempre recibe undefined y termina guardando el primer
    // valor de la lista sin que el usuario lo haya tocado.
    this.tarifaLimpieza = cliente.tarifaLimpieza && {
      id: cliente.tarifaLimpieza.id ?? cliente.tarifaLimpieza._id,
      nombre: cliente.tarifaLimpieza.nombre,
      precio: cliente.tarifaLimpieza.precio,
    };
    this.semana = cliente.semana;
    this.status = cliente.status;
    this.barrio = cliente.barrio && {
      id: cliente.barrio.id ?? cliente.barrio._id,
      nombre: cliente.barrio.nombre,
      orden: cliente.barrio.orden,
    };
    this.ordenEnBarrio = cliente.ordenEnBarrio;
  }
}
