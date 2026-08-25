export class EmpleadoSemanaDTO {
  constructor(empleadoSemana) {
    this.id = empleadoSemana.id ?? empleadoSemana._id;
    this.cliente = empleadoSemana.cliente;
    this.weekStart = empleadoSemana.weekStart;
    this.nombre = empleadoSemana.nombre;
  }
}
