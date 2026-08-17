const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PIN_REGEX = /^\d{4}$/;

export function validarRegistro(req, res, next) {
  const { email, pin } = req.body;

  if (!email || !pin) {
    const error = new Error("Faltan datos");
    error.statusCode = 400;
    return next(error);
  }
  if (!EMAIL_REGEX.test(email)) {
    const error = new Error("El email no tiene un formato válido");
    error.statusCode = 400;
    return next(error);
  }
  if (!PIN_REGEX.test(pin)) {
    const error = new Error("El PIN debe ser numérico de 4 dígitos");
    error.statusCode = 400;
    return next(error);
  }

  next();
}

export function validarLogin(req, res, next) {
  const { email, pin } = req.body;

  if (!email || !pin) {
    const error = new Error("Faltan credenciales");
    error.statusCode = 400;
    return next(error);
  }

  next();
}
