export class BarrioDTO {
  constructor(barrio) {
    this.id = barrio.id ?? barrio._id;
    this.nombre = barrio.nombre;
    this.orden = barrio.orden;
  }
}
