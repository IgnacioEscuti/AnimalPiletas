import { usuarioRepository } from "../repositories/usuario.repository.js";
import { createHash, isValidPin } from "../utils/hash.utils.js";
import { generateToken } from "../utils/jwt.utils.js";
import { handleMongooseError } from "../utils/mongooseError.utils.js";
import { UsuarioDTO } from "../DTOs/usuario.dto.js";

const MAX_INTENTOS_FALLIDOS = 10;
const BLOQUEO_EN_MS = 2 * 60 * 1000;

export class UsuarioService {
  constructor(repository) {
    this.repository = repository;
  }

  async registrar({ email, pin }) {
    const existente = await this.repository.findByEmail(email);
    if (existente) {
      const error = new Error("El email ya está registrado");
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await createHash(pin);

    try {
      return await this.repository.create({ email, passwordHash, estado: "pendiente" });
    } catch (error) {
      handleMongooseError(error);
    }
  }

  async login(email, pin) {
    const usuario = await this.repository.findByEmail(email);
    if (!usuario) {
      const error = new Error("Credenciales inválidas");
      error.statusCode = 401;
      throw error;
    }

    if (usuario.bloqueadoHasta && usuario.bloqueadoHasta > new Date()) {
      const minutosRestantes = Math.ceil((usuario.bloqueadoHasta - new Date()) / 60000);
      const error = new Error(
        `Cuenta bloqueada por demasiados intentos fallidos. Volvé a intentar en ${minutosRestantes} minuto(s).`
      );
      error.statusCode = 423;
      throw error;
    }

    const pinValido = await isValidPin(pin, usuario.passwordHash);
    if (!pinValido) {
      usuario.intentosFallidos += 1;
      if (usuario.intentosFallidos >= MAX_INTENTOS_FALLIDOS) {
        usuario.bloqueadoHasta = new Date(Date.now() + BLOQUEO_EN_MS);
      }
      await usuario.save();

      const error = new Error("Credenciales inválidas");
      error.statusCode = 401;
      throw error;
    }

    // Después de validar el PIN a propósito: si se chequeara antes, un
    // tercero podría descubrir qué emails existen solo por el mensaje.
    if (usuario.estado === "pendiente") {
      const error = new Error("Tu cuenta está esperando aprobación");
      error.statusCode = 403;
      throw error;
    }

    usuario.intentosFallidos = 0;
    usuario.bloqueadoHasta = undefined;
    await usuario.save();

    return usuario;
  }

  async getUsuarios() {
    return this.repository.findAprobados();
  }

  async getPendientes() {
    return this.repository.findPendientes();
  }

  async aprobarPendiente(id) {
    let usuario;
    try {
      usuario = await this.repository.aprobarPendiente(id);
    } catch (error) {
      handleMongooseError(error);
    }
    if (!usuario) throw this.errorSolicitudResuelta();
    return usuario;
  }

  async rechazarPendiente(id) {
    let usuario;
    try {
      usuario = await this.repository.eliminarPendiente(id);
    } catch (error) {
      handleMongooseError(error);
    }
    if (!usuario) throw this.errorSolicitudResuelta();
    return usuario;
  }

  errorSolicitudResuelta() {
    const error = new Error("Esta solicitud ya fue resuelta por otro admin");
    error.statusCode = 409;
    return error;
  }

  generarToken(usuario) {
    const dto = new UsuarioDTO(usuario);
    return generateToken({ id: dto.id, email: dto.email });
  }
}

export const usuarioService = new UsuarioService(usuarioRepository);
