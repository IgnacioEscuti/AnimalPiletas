export class PrecioPastillasDTO {
  constructor(precioPastillas) {
    this.id = precioPastillas.id ?? precioPastillas._id;
    this.precio = precioPastillas.precio;
  }
}
