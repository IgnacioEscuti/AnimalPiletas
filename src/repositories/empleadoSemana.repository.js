import { EmpleadoSemanaDAO } from "../DAOs/empleadoSemana.dao.js";

const empleadoSemanaDAO = new EmpleadoSemanaDAO();

export class EmpleadoSemanaRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async find(filters) {
    return this.dao.find(filters);
  }

  async upsertPorClienteYSemana(cliente, weekStart, nombre) {
    return this.dao.upsertPorClienteYSemana(cliente, weekStart, nombre);
  }
}

export const empleadoSemanaRepository = new EmpleadoSemanaRepository(empleadoSemanaDAO);
