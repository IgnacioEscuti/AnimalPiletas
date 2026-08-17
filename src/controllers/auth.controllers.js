import { usuarioService } from "../services/usuario.service.js";
import { UsuarioDTO } from "../DTOs/usuario.dto.js";
import { getCookieOptions } from "../utils/cookie.utils.js";

export async function registrar(req, res) {
  res.status(201).json({ usuario: new UsuarioDTO(req.usuario) });
}

export async function login(req, res) {
  const token = usuarioService.generarToken(req.usuario);
  res.cookie("token", token, getCookieOptions());
  res.status(200).json({ usuario: new UsuarioDTO(req.usuario) });
}

export async function logout(req, res) {
  res.clearCookie("token", getCookieOptions());
  res.status(200).json({ ok: true });
}

export async function getUsuarioActual(req, res) {
  res.status(200).json({ usuario: new UsuarioDTO(req.usuario) });
}
