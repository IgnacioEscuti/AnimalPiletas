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
      enum: ["1", "2", "todas", "unaVez"],
      default: "todas",
    },
    semanaUnaVezDesde: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["activo", "cancelado"],
      default: "activo",
    },
    barrio: {
      type: Schema.Types.ObjectId,
      ref: "barrio",
      default: null,
    },
    ordenEnBarrio: {
      type: Number,
      default: 0,
    },
    encargado: {
      type: Schema.Types.ObjectId,
      ref: "usuario",
      default: null,
    },
  },
  { timestamps: true }
);

clienteSchema.index({ encargado: 1 });

export const clienteModel = model("cliente", clienteSchema);
