export class ResumenClienteDTO {
  constructor(fila) {
    this.clienteId = fila.clienteId;
    this.clienteNombre = fila.clienteNombre;
    this.limpieza = fila.limpieza;
    this.pastillas = fila.pastillas;
    this.extra = fila.extra;
    this.empleados = fila.empleados;
    this.totalGeneral = fila.totalGeneral;
  }
}
