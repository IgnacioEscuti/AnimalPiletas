import { Schema, model } from "mongoose";

const extraAdicionalSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    precio: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const limpiezaAdicionalSchema = new Schema(
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
    cantidadPastillas: {
      type: Number,
      default: 0,
      min: 0,
    },
    precioPastillasUsado: {
      type: Number,
      required: true,
      min: 0,
    },
    extras: {
      type: [extraAdicionalSchema],
      default: [],
    },
    cargadoPor: {
      type: Schema.Types.ObjectId,
      ref: "usuario",
      required: true,
    },
  },
  { timestamps: true }
);

limpiezaAdicionalSchema.index({ fecha: 1 });
limpiezaAdicionalSchema.index({ cliente: 1, fecha: 1 });

export const limpiezaAdicionalModel = model("limpiezaAdicional", limpiezaAdicionalSchema);
