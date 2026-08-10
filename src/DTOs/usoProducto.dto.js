export class UsoProductoDTO {
  constructor(usoProducto) {
    this.id = usoProducto.id ?? usoProducto._id;
    this.cliente = usoProducto.cliente;
    this.fecha = usoProducto.fecha;
    this.nombreProducto = usoProducto.nombreProducto;
    this.precioUnitario = usoProducto.precioUnitario;
  }
}
