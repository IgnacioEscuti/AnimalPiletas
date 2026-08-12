export class UsoPastillasDTO {
  constructor(usoPastillas) {
    this.id = usoPastillas.id ?? usoPastillas._id;
    this.cliente = usoPastillas.cliente;
    this.fecha = usoPastillas.fecha;
    this.cantidad = usoPastillas.cantidad;
    this.precioUnitarioUsado = usoPastillas.precioUnitarioUsado;
    this.empleado = usoPastillas.empleado;
  }
}
