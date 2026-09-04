export function errorHandler(err, req, res, next) {
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(`Error no controlado en ${req.method} ${req.originalUrl}:`, err);
  res.status(500).json({ error: "Ocurrió un error en el servidor" });
}
