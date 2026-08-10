export class ResumenClienteDTO {
  constructor(fila) {
    this.clienteId = fila.clienteId;
    this.clienteNombre = fila.clienteNombre;
    this.limpieza = fila.limpieza;
    this.pastillas = fila.pastillas;
    this.producto = fila.producto;
    this.totalGeneral = fila.totalGeneral;
  }
}
