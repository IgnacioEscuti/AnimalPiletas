import mongoose from "mongoose";
import { connectDB } from "../config/database.js";
import { precioPastillasModel } from "../models/precioPastillas.model.js";

const seedPrecioPastillas = async () => {
  await connectDB();

  await precioPastillasModel.findOneAndUpdate(
    {},
    { precio: 500 },
    { upsert: true, returnDocument: "after" }
  );

  console.log("Precio de pastillas cargado correctamente");
  await mongoose.disconnect();
};

seedPrecioPastillas().catch((error) => {
  console.error("Error al cargar el precio de pastillas:", error);
  process.exit(1);
});
