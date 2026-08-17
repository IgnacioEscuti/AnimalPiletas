import passport from "passport";

export function authenticateRegistro(req, res, next) {
  passport.authenticate("registro", { session: false }, (err, usuario, info) => {
    if (err) return next(err);
    if (!usuario) {
      return res.status(info?.statusCode || 400).json({ error: info?.message || "No se pudo registrar el usuario" });
    }
    req.usuario = usuario;
    next();
  })(req, res, next);
}

export function authenticateLogin(req, res, next) {
  passport.authenticate("login", { session: false }, (err, usuario, info) => {
    if (err) return next(err);
    if (!usuario) {
      return res.status(info?.statusCode || 401).json({ error: info?.message || "Credenciales inválidas" });
    }
    req.usuario = usuario;
    next();
  })(req, res, next);
}
