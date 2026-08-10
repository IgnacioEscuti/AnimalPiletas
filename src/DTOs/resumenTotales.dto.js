export class ResumenTotalesDTO {
  constructor(totales) {
    this.totalLimpiezas = totales.totalLimpiezas;
    this.totalPastillas = totales.totalPastillas;
    this.totalProductos = totales.totalProductos;
  }
}
