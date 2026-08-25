import mongoose from "mongoose";
import { connectDB } from "../config/database.js";
import { limpiezaModel } from "../models/limpieza.model.js";
import { usoPastillasModel } from "../models/usoPastillas.model.js";
import { rangoSemanal } from "../utils/fecha.utils.js";

// Migración de una sola corrida. Antes de este cambio, Limpieza y
// UsoPastillas tenían un documento por cliente+día; ahora pasan a tener uno
// solo por cliente+semana (weekStart). Si en la semana actual un cliente
// quedó con más de un documento (uno por cada día que se cargó antes de este
// cambio), se consolidan en uno: se conserva el más reciente (que ya tiene
// el realizada/cantidad correcto), se le pisa la fecha con la del más
// antiguo del grupo, y se le setea weekStart. Los demás se borran.
// Documentos de semanas anteriores no se tocan.

export async function consolidarColeccion(model, nombreColeccion) {
  const { inicio, fin } = rangoSemanal();

  const documentos = await model
    .find({ fecha: { $gte: inicio, $lt: fin } })
    .sort({ fecha: 1 });

  const porCliente = new Map();
  for (const doc of documentos) {
    const clave = doc.cliente.toString();
    if (!porCliente.has(clave)) porCliente.set(clave, []);
    porCliente.get(clave).push(doc);
  }

  let consolidados = 0;
  let soloActualizados = 0;

  for (const docs of porCliente.values()) {
    if (docs.length === 1) {
      const [unico] = docs;
      if (!unico.weekStart) {
        unico.weekStart = inicio;
        await unico.save();
        soloActualizados++;
      }
      continue;
    }

    const masAntiguo = docs[0];
    const masReciente = docs[docs.length - 1];

    masReciente.fecha = masAntiguo.fecha;
    masReciente.weekStart = inicio;
    await masReciente.save();

    const idsABorrar = docs.slice(0, -1).map((doc) => doc._id);
    await model.deleteMany({ _id: { $in: idsABorrar } });

    consolidados++;
  }

  console.log(
    `${nombreColeccion}: ${consolidados} cliente(s) consolidados, ${soloActualizados} documento(s) sin duplicar (solo se les seteó weekStart).`
  );
}

const migrar = async () => {
  await connectDB();

  await consolidarColeccion(limpiezaModel, "Limpieza");
  await consolidarColeccion(usoPastillasModel, "UsoPastillas");

  console.log("Migración completada.");
  await mongoose.disconnect();
};

const esEjecucionDirecta = process.argv[1]?.endsWith("consolidarSemanaActual.migration.js");
if (esEjecucionDirecta) {
  migrar().catch((error) => {
    console.error("Error en la migración:", error);
    process.exit(1);
  });
}
