import { Schema, model } from "mongoose";

const usoExtraSchema = new Schema(
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
    nombreExtra: {
      type: String,
      required: true,
      trim: true,
    },
    precioUnitario: {
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

export const usoExtraModel = model("usoExtra", usoExtraSchema);
