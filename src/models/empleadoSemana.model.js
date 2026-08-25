import { Schema, model } from "mongoose";

const empleadoSemanaSchema = new Schema(
  {
    cliente: {
      type: Schema.Types.ObjectId,
      ref: "cliente",
      required: true,
    },
    weekStart: {
      type: Date,
      required: true,
    },
    nombre: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

export const empleadoSemanaModel = model("empleadoSemana", empleadoSemanaSchema);
