export class UsoExtraDTO {
  constructor(usoExtra) {
    this.id = usoExtra.id ?? usoExtra._id;
    this.cliente = usoExtra.cliente;
    this.fecha = usoExtra.fecha;
    this.nombreExtra = usoExtra.nombreExtra;
    this.precioUnitario = usoExtra.precioUnitario;
    this.empleado = usoExtra.empleado;
  }
}
