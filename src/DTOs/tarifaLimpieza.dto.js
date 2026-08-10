export class TarifaLimpiezaDTO {
  constructor(tarifa) {
    this.id = tarifa.id ?? tarifa._id;
    this.nombre = tarifa.nombre;
    this.precio = tarifa.precio;
  }
}
