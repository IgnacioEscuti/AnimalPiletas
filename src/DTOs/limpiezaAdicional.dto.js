export class LimpiezaAdicionalDTO {
  constructor(adicional) {
    this.id = adicional.id ?? adicional._id;
    this.cliente = adicional.cliente;
    this.fecha = adicional.fecha;
    this.tarifa = adicional.tarifa;
    this.precioUnitarioUsado = adicional.precioUnitarioUsado;
    this.extra = adicional.extra;
    this.cantidadPastillas = adicional.cantidadPastillas;
    this.precioPastillasUsado = adicional.precioPastillasUsado;
    this.extras = adicional.extras.map(({ nombre, precio }) => ({ nombre, precio }));
    this.cargadoPor = adicional.cargadoPor && {
      id: adicional.cargadoPor.id ?? adicional.cargadoPor._id,
      nombre: adicional.cargadoPor.nombre,
      email: adicional.cargadoPor.email,
    };
  }
}
