import { UsoProductoDAO } from "../DAOs/usoProducto.dao.js";

const usoProductoDAO = new UsoProductoDAO();

export class UsoProductoRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async find(filters) {
    return this.dao.find(filters);
  }

  async upsertPorClienteYFecha(cliente, fecha, data) {
    return this.dao.upsertPorClienteYFecha(cliente, fecha, data);
  }
}

export const usoProductoRepository = new UsoProductoRepository(usoProductoDAO);
