export class LimpiezaDTO {
  constructor(limpieza) {
    this.id = limpieza.id ?? limpieza._id;
    this.cliente = limpieza.cliente;
    this.fecha = limpieza.fecha;
    this.tarifa = limpieza.tarifa;
    this.precioUnitarioUsado = limpieza.precioUnitarioUsado;
    this.extra = limpieza.extra;
    this.realizada = limpieza.realizada;
    this.empleado = limpieza.empleado;
  }
}
