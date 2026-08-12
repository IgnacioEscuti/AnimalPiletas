import { Schema, model } from "mongoose";

const clienteSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    direccion: {
      type: String,
      trim: true,
      default: "",
    },
    telefono: {
      type: String,
      trim: true,
      default: "",
    },
    tarifaLimpieza: {
      type: Schema.Types.ObjectId,
      ref: "tarifaLimpieza",
      required: true,
    },
    semana: {
      type: String,
      enum: ["1", "2", "todas"],
      default: "todas",
    },
    status: {
      type: String,
      enum: ["activo", "cancelado"],
      default: "activo",
    },
  },
  { timestamps: true }
);

export const clienteModel = model("cliente", clienteSchema);
