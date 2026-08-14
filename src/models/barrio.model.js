import { Schema, model } from "mongoose";

const barrioSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    orden: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

export const barrioModel = model("barrio", barrioSchema);
