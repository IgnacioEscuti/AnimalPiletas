export function handleMongooseError(error) {
  if (error.statusCode) throw error;

  if (error.name === "CastError") {
    const err = new Error("ID inválido");
    err.statusCode = 400;
    throw err;
  }
  if (error.code === 11000) {
    const err = new Error("ya existe un registro con ese nombre");
    err.statusCode = 409;
    throw err;
  }
  if (error.name === "ValidationError") {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
  throw error;
}
