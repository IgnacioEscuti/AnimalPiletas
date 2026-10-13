// Lo que suma la visita entera: la limpieza solo si se realizó; pastillas
// y extras siempre (mismo criterio que el resumen).
function calcularTotal(adicional) {
  const limpieza = adicional.realizada ? adicional.precioUnitarioUsado + adicional.extra : 0;
  const pastillas = adicional.cantidadPastillas * adicional.precioPastillasUsado;
  const extras = adicional.extras.reduce((suma, { precio }) => suma + precio, 0);
  return limpieza + pastillas + extras;
}

export class LimpiezaAdicionalDTO {
  constructor(adicional) {
    this.id = adicional.id ?? adicional._id;
    this.cliente = adicional.cliente && {
      id: adicional.cliente.id ?? adicional.cliente._id,
      nombre: adicional.cliente.nombre,
    };
    this.fecha = adicional.fecha;
    this.tarifa = adicional.tarifa;
    this.precioUnitarioUsado = adicional.precioUnitarioUsado;
    this.extra = adicional.extra;
    this.realizada = adicional.realizada;
    this.empleado = adicional.empleado;
    this.cantidadPastillas = adicional.cantidadPastillas;
    this.precioPastillasUsado = adicional.precioPastillasUsado;
    this.extras = adicional.extras.map(({ nombre, precio }) => ({ nombre, precio }));
    this.cargadoPor = adicional.cargadoPor && {
      id: adicional.cargadoPor.id ?? adicional.cargadoPor._id,
      nombre: adicional.cargadoPor.nombre,
      email: adicional.cargadoPor.email,
    };
    this.total = calcularTotal(adicional);
  }
}
