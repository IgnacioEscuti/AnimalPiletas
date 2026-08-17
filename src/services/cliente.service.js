import { clienteRepository } from "../repositories/cliente.repository.js";
import { tarifaLimpiezaRepository } from "../repositories/tarifaLimpieza.repository.js";
import { barrioRepository } from "../repositories/barrio.repository.js";
import { usuarioRepository } from "../repositories/usuario.repository.js";
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

function idDe(usuarioODoc) {
  return (usuarioODoc.id ?? usuarioODoc._id).toString();
}

export class ClienteService {
  constructor(repository, tarifaLimpiezaRepository, barrioRepository, usuarioRepository) {
    this.repository = repository;
    this.tarifaLimpiezaRepository = tarifaLimpiezaRepository;
    this.barrioRepository = barrioRepository;
    this.usuarioRepository = usuarioRepository;
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

  async validarUsuarioExiste(usuarioId) {
    if (!usuarioId) return;

    let usuario;
    try {
      usuario = await this.usuarioRepository.findById(usuarioId);
    } catch (error) {
      handleMongooseError(error);
    }

    if (!usuario) {
      const error = new Error("el usuario indicado no existe");
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

  // Un "encargado" nunca puede elegir a quién se asigna un cliente — se
  // fuerza siempre a su propio id, ignorando cualquier valor que venga en
  // el body. Un "admin" elige libremente (incluido dejarlo sin asignar).
  async resolverEncargadoParaCreacion(data, usuarioActual) {
    if (usuarioActual.rol === "encargado") {
      return idDe(usuarioActual);
    }
    if (data.encargado) {
      await this.validarUsuarioExiste(data.encargado);
      return data.encargado;
    }
    return null;
  }

  // A diferencia de la creación, una edición puede ser parcial (por
  // ejemplo, solo cambiar la semana) — para un admin, el campo encargado
  // solo se toca si vino explícitamente en el body.
  async resolverEncargadoParaEdicion(data, usuarioActual) {
    if (usuarioActual.rol === "encargado") {
      return idDe(usuarioActual);
    }
    if (!("encargado" in data)) {
      return undefined;
    }
    if (data.encargado) {
      await this.validarUsuarioExiste(data.encargado);
      return data.encargado;
    }
    return null;
  }

  verificarAcceso(cliente, usuarioActual) {
    if (usuarioActual.rol !== "encargado") return;

    const encargadoId = cliente.encargado?.id ?? cliente.encargado?._id ?? cliente.encargado;
    if (!encargadoId || encargadoId.toString() !== idDe(usuarioActual)) {
      const error = new Error("no tenés permiso para acceder a este cliente");
      error.statusCode = 403;
      throw error;
    }
  }

  async obtenerClienteConAcceso(id, usuarioActual) {
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

    this.verificarAcceso(cliente, usuarioActual);
    return cliente;
  }

  async createCliente(data, usuarioActual) {
    await this.validarTarifaExiste(data.tarifaLimpieza);
    await this.validarBarrioExiste(data.barrio);
    await this.validarNombreDisponible(data.nombre);
    const encargado = await this.resolverEncargadoParaCreacion(data, usuarioActual);
    const datos = { ...data, encargado };

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
          ...datos,
          status: "activo",
        });
      }
      return await this.repository.create(datos);
    } catch (error) {
      handleMongooseError(error);
    }
  }

  // Clientes sin encargado asignado (por ejemplo, los que ya existían
  // antes de esta función) solo los ve el admin.
  async getClientes(usuarioActual) {
    const filtro = usuarioActual.rol === "encargado" ? { encargado: idDe(usuarioActual) } : {};
    return this.repository.findActivos(filtro);
  }

  async getClienteById(id, usuarioActual) {
    return this.obtenerClienteConAcceso(id, usuarioActual);
  }

  async updateCliente(id, data, usuarioActual) {
    await this.obtenerClienteConAcceso(id, usuarioActual);

    if (data.tarifaLimpieza) {
      await this.validarTarifaExiste(data.tarifaLimpieza);
    }
    await this.validarBarrioExiste(data.barrio);
    if (data.nombre) {
      await this.validarNombreDisponible(data.nombre, id);
    }

    const encargado = await this.resolverEncargadoParaEdicion(data, usuarioActual);
    const datos = encargado === undefined ? { ...data } : { ...data, encargado };

    let cliente;
    try {
      cliente = await this.repository.findByIdAndUpdate(id, datos);
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
  barrioRepository,
  usuarioRepository
);
