import { ResumenClienteDTO } from "./resumenCliente.dto.js";

export class ResumenGrupoBarrioDTO {
  constructor(grupo) {
    this.barrioId = grupo.barrioId;
    this.barrioNombre = grupo.barrioNombre;
    this.clientes = grupo.clientes.map((cliente) => new ResumenClienteDTO(cliente));
  }
}
