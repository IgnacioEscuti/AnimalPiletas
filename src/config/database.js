import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
  // Errores post-conexión (ej. la DB se cae mientras el server ya está
  // corriendo) no rechazan ninguna promesa — sin este listener quedarían
  // silenciosos.
  mongoose.connection.on("error", (error) => {
    console.error("Error de conexión a MongoDB:", error);
  });

  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.error("No se pudo conectar a MongoDB:", error);
    throw error;
  }
}
