import app from "./app.js";
import { connectDB } from "./config/database.js";
import { env } from "./config/env.js";

const PORT = env.PORT || 3000;

const iniciarServidor = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
};

iniciarServidor().catch((error) => {
  console.error("Error al iniciar el servidor:", error);
  process.exit(1);
});
