import { Schema, model } from "mongoose";

// Documento único: el precio fijo de pastillas que se congela en cada
// UsoPastillas al momento de la carga. No hay más de un documento.
const precioPastillasSchema = new Schema(
  {
    precio: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

export const precioPastillasModel = model("precioPastillas", precioPastillasSchema);
