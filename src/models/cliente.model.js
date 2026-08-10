import { Schema, model } from "mongoose";

const clienteSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
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
  },
  { timestamps: true }
);

export const clienteModel = model("cliente", clienteSchema);
