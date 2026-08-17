import { Schema, model } from "mongoose";

const usuarioSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "el formato del email no es válido"],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    nombre: {
      type: String,
      trim: true,
    },
    intentosFallidos: {
      type: Number,
      default: 0,
    },
    bloqueadoHasta: {
      type: Date,
    },
    rol: {
      type: String,
      enum: ["admin", "encargado"],
      default: "encargado",
    },
  },
  { timestamps: true }
);

export const usuarioModel = model("usuario", usuarioSchema);
