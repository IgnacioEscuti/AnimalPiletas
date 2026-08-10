import mongoose from "mongoose";
import { connectDB } from "../config/database.js";
import { tarifaLimpiezaModel } from "../models/tarifaLimpieza.model.js";

const tarifas = [
  { nombre: "bajo", precio: 22000 },
  { nombre: "medio", precio: 25000 },
  { nombre: "alto", precio: 28000 },
];

const seedTarifas = async () => {
  await connectDB();

  for (const tarifa of tarifas) {
    await tarifaLimpiezaModel.findOneAndUpdate(
      { nombre: tarifa.nombre },
      tarifa,
      { upsert: true, returnDocument: "after" }
    );
  }

  console.log("Tarifas cargadas correctamente");
  await mongoose.disconnect();
};

seedTarifas().catch((error) => {
  console.error("Error al cargar las tarifas:", error);
  process.exit(1);
});
