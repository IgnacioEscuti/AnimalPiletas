import passport from "passport";

export function authenticateActual(req, res, next) {
  passport.authenticate("actual", { session: false }, (err, usuario) => {
    if (err) return next(err);
    if (!usuario) return res.status(401).json({ error: "No hay una sesión válida" });
    req.usuario = usuario;
    next();
  })(req, res, next);
}

export function autorizarRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: "No tenés permiso para realizar esta acción" });
    }
    next();
  };
}
