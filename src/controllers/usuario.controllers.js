import { usuarioService } from "../services/usuario.service.js";
import { UsuarioDTO } from "../DTOs/usuario.dto.js";

export async function getUsuarios(req, res, next) {
  try {
    const usuarios = await usuarioService.getUsuarios();
    res.status(200).json({ usuarios: usuarios.map((usuario) => new UsuarioDTO(usuario)) });
  } catch (error) {
    next(error);
  }
}

export async function getPendientes(req, res, next) {
  try {
    const pendientes = await usuarioService.getPendientes();
    res.status(200).json({ usuarios: pendientes.map((usuario) => new UsuarioDTO(usuario)) });
  } catch (error) {
    next(error);
  }
}

export async function aprobarPendiente(req, res, next) {
  try {
    const usuario = await usuarioService.aprobarPendiente(req.params.id);
    res.status(200).json({ usuario: new UsuarioDTO(usuario) });
  } catch (error) {
    next(error);
  }
}

export async function rechazarPendiente(req, res, next) {
  try {
    await usuarioService.rechazarPendiente(req.params.id);
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
}
