import { Schema, model } from "mongoose";

const usoProductoSchema = new Schema(
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
    nombreProducto: {
      type: String,
      required: true,
      trim: true,
    },
    precioUnitario: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

export const usoProductoModel = model("usoProducto", usoProductoSchema);
