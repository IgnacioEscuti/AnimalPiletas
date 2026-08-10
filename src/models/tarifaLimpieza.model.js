import { Schema, model } from "mongoose";

const tarifaLimpiezaSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      enum: ["bajo", "medio", "alto"],
      unique: true,
    },
    precio: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

export const tarifaLimpiezaModel = model("tarifaLimpieza", tarifaLimpiezaSchema);
