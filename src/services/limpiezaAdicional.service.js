import { limpiezaAdicionalRepository } from "../repositories/limpiezaAdicional.repository.js";
import { clienteRepository } from "../repositories/cliente.repository.js";
import { precioPastillasService } from "./precioPastillas.service.js";
import { normalizarNombreExtra } from "./usoExtra.service.js";
import { handleMongooseError } from "../utils/mongooseError.utils.js";
import { hoyNormalizado, rangoSemanal } from "../utils/fecha.utils.js";

function idDe(usuarioODoc) {
  return (usuarioODoc.id ?? usuarioODoc._id).toString();
}

export class LimpiezaAdicionalService {
  constructor(repository, clienteRepository) {
    this.repository = repository;
    this.clienteRepository = clienteRepository;
  }

  // Cualquier usuario puede cargar en cualquier cliente activo, sea o no
  // su encargado: por eso no se usa verificarAcceso de ClienteService.
  async registrar(
    { cliente: clienteId, extra, realizada, empleado, cantidadPastillas, extras },
    usuarioActual
  ) {
    if (extras !== undefined && !Array.isArray(extras)) {
      const error = new Error("extras debe ser una lista");
      error.statusCode = 400;
      throw error;
    }

    let cliente;
    try {
      cliente = await this.clienteRepository.findById(clienteId);
    } catch (error) {
      handleMongooseError(error);
    }

    if (!cliente || cliente.status === "cancelado") {
      const error = new Error("cliente no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const precioPastillas = await precioPastillasService.getPrecio();

    try {
      return await this.repository.crear({
        cliente: clienteId,
        fecha: hoyNormalizado(),
        tarifa: cliente.tarifaLimpieza.id ?? cliente.tarifaLimpieza._id,
        precioUnitarioUsado: cliente.tarifaLimpieza.precio,
        extra,
        realizada,
        empleado,
        cantidadPastillas,
        precioPastillasUsado: precioPastillas.precio,
        extras: extras?.map((item) => ({
          nombre: normalizarNombreExtra(String(item?.nombre ?? "")),
          precio: item?.precio,
        })),
        cargadoPor: idDe(usuarioActual),
      });
    } catch (error) {
      handleMongooseError(error);
    }
  }

  // Sin clienteId devuelve las de todos los clientes (la lista "Limpiezas
  // extra de esta semana" del buscador).
  async getDeEstaSemana(clienteId, usuarioActual) {
    const { inicio, fin } = rangoSemanal();
    const filtro = { fecha: { $gte: inicio, $lt: fin } };
    if (clienteId) filtro.cliente = clienteId;
    if (usuarioActual.rol === "encargado") filtro.cargadoPor = idDe(usuarioActual);

    try {
      return await this.repository.find(filtro);
    } catch (error) {
      handleMongooseError(error);
    }
  }

  async eliminar(id, usuarioActual) {
    let adicional;
    try {
      adicional = await this.repository.findById(id);
    } catch (error) {
      handleMongooseError(error);
    }

    if (!adicional) {
      const error = new Error("limpieza adicional no encontrada");
      error.statusCode = 404;
      throw error;
    }

    if (usuarioActual.rol !== "admin" && adicional.cargadoPor.toString() !== idDe(usuarioActual)) {
      const error = new Error("solo quien la cargó o un admin puede eliminarla");
      error.statusCode = 403;
      throw error;
    }

    await this.repository.eliminarPorId(id);
  }
}

export const limpiezaAdicionalService = new LimpiezaAdicionalService(
  limpiezaAdicionalRepository,
  clienteRepository
);
