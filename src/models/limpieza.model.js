import { Schema, model } from "mongoose";

const limpiezaSchema = new Schema(
  {
    cliente: {
      type: Schema.Types.ObjectId,
      ref: "cliente",
      required: true,
    },
    fecha: {
      type: Date,
      required: true,
    },
    weekStart: {
      type: Date,
    },
    tarifa: {
      type: Schema.Types.ObjectId,
      ref: "tarifaLimpieza",
      required: true,
    },
    precioUnitarioUsado: {
      type: Number,
      required: true,
      min: 0,
    },
    extra: {
      type: Number,
      default: 0,
      min: 0,
    },
    realizada: {
      type: Boolean,
      required: true,
    },
    empleado: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

export const limpiezaModel = model("limpieza", limpiezaSchema);
