import { clienteRepository } from "../repositories/cliente.repository.js";
import { tarifaLimpiezaRepository } from "../repositories/tarifaLimpieza.repository.js";
import { barrioRepository } from "../repositories/barrio.repository.js";
import { handleMongooseError } from "../utils/mongooseError.utils.js";

function escaparRegExp(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Regex que matchea el nombre exacto ignorando mayúsculas/minúsculas y
// cualquier cantidad de espacios entre palabras (de cualquiera de los
// dos lados de la comparación) — así "  juan   perez" y "Juan Perez"
// se consideran el mismo nombre.
function regexNombreExacto(nombre) {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean).map(escaparRegExp);
  return new RegExp(`^${palabras.join("\\s+")}$`, "i");
}

export class ClienteService {
  constructor(repository, tarifaLimpiezaRepository, barrioRepository) {
    this.repository = repository;
    this.tarifaLimpiezaRepository = tarifaLimpiezaRepository;
    this.barrioRepository = barrioRepository;
  }

  async validarBarrioExiste(barrioId) {
    if (!barrioId) return;

    let barrio;
    try {
      barrio = await this.barrioRepository.findById(barrioId);
    } catch (error) {
      handleMongooseError(error);
    }

    if (!barrio) {
      const error = new Error("el barrio indicado no existe");
      error.statusCode = 400;
      throw error;
    }
  }

  async validarTarifaExiste(tarifaId) {
    let tarifa;
    try {
      tarifa = await this.tarifaLimpiezaRepository.findById(tarifaId);
    } catch (error) {
      handleMongooseError(error);
    }

    if (!tarifa) {
      const error = new Error("la tarifa de limpieza indicada no existe");
      error.statusCode = 400;
      throw error;
    }
  }

  async validarNombreDisponible(nombre, idAExcluir = null) {
    let existente;
    try {
      existente = await this.repository.findOne({
        nombre: regexNombreExacto(nombre),
        status: "activo",
      });
    } catch (error) {
      handleMongooseError(error);
    }

    if (existente && existente.id !== idAExcluir) {
      const error = new Error("ya existe ese nombre");
      error.statusCode = 400;
      throw error;
    }
  }

  async createCliente(data) {
    await this.validarTarifaExiste(data.tarifaLimpieza);
    await this.validarBarrioExiste(data.barrio);
    await this.validarNombreDisponible(data.nombre);

    let cancelado;
    try {
      cancelado = await this.repository.findOne({
        nombre: regexNombreExacto(data.nombre),
        status: "cancelado",
      });
    } catch (error) {
      handleMongooseError(error);
    }

    try {
      if (cancelado) {
        return await this.repository.findByIdAndUpdate(cancelado.id, {
          ...data,
          status: "activo",
        });
      }
      return await this.repository.create(data);
    } catch (error) {
      handleMongooseError(error);
    }
  }

  async getClientes() {
    return this.repository.findActivos();
  }

  async getClienteById(id) {
    let cliente;
    try {
      cliente = await this.repository.findById(id);
    } catch (error) {
      handleMongooseError(error);
    }

    if (!cliente) {
      const error = new Error("cliente no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return cliente;
  }

  async updateCliente(id, data) {
    if (data.tarifaLimpieza) {
      await this.validarTarifaExiste(data.tarifaLimpieza);
    }
    await this.validarBarrioExiste(data.barrio);
    if (data.nombre) {
      await this.validarNombreDisponible(data.nombre, id);
    }

    let cliente;
    try {
      cliente = await this.repository.findByIdAndUpdate(id, data);
    } catch (error) {
      handleMongooseError(error);
    }

    if (!cliente) {
      const error = new Error("cliente no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return cliente;
  }

  async reordenarEnBarrio(ids) {
    try {
      await Promise.all(
        ids.map((id, index) => this.repository.findByIdAndUpdate(id, { ordenEnBarrio: index }))
      );
    } catch (error) {
      handleMongooseError(error);
    }
  }
}

export const clienteService = new ClienteService(
  clienteRepository,
  tarifaLimpiezaRepository,
  barrioRepository
);
