import rateLimit from "express-rate-limit";

export const limiterLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demasiados intentos de inicio de sesión. Esperá unos minutos." },
});

export const limiterRegistro = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demasiados registros desde esta conexión. Probá más tarde." },
});
