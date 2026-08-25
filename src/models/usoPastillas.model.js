import { Schema, model } from "mongoose";

const usoPastillasSchema = new Schema(
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
    cantidad: {
      type: Number,
      required: true,
      min: 0,
    },
    precioUnitarioUsado: {
      type: Number,
      required: true,
      min: 0,
    },
    empleado: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

usoPastillasSchema.index({ cliente: 1, weekStart: 1 });
usoPastillasSchema.index({ fecha: 1 });

export const usoPastillasModel = model("usoPastillas", usoPastillasSchema);
