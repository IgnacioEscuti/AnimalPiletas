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
