export class UsuarioDTO {
  constructor(usuario) {
    this.id = usuario.id ?? usuario._id;
    this.email = usuario.email;
    this.nombre = usuario.nombre;
    this.rol = usuario.rol;
  }
}
