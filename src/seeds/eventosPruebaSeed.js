import mongoose from "mongoose";
import { connectDB } from "../config/database.js";
import { clienteModel } from "../models/cliente.model.js";
import { tarifaLimpiezaModel } from "../models/tarifaLimpieza.model.js";
import { precioPastillasModel } from "../models/precioPastillas.model.js";
import { limpiezaModel } from "../models/limpieza.model.js";
import { usoPastillasModel } from "../models/usoPastillas.model.js";
import { usoProductoModel } from "../models/usoProducto.model.js";
import { hoyNormalizado } from "../utils/fecha.utils.js";

// Carga clientes y eventos de prueba repartidos en al menos 3 semanas y
// 2 meses distintos, para poder probar el Resumen sin esperar semanas
// reales. Es idempotente (upsert por cliente+fecha): correrlo de nuevo
// solo refresca los mismos datos, no duplica nada.

function diasAntes(fecha, dias) {
  const nueva = new Date(fecha);
  nueva.setDate(nueva.getDate() - dias);
  return nueva;
}

function mesPasadoDia(fecha, dia) {
  return new Date(fecha.getFullYear(), fecha.getMonth() - 1, dia);
}

const seedEventosPrueba = async () => {
  await connectDB();

  const tarifa = await tarifaLimpiezaModel.findOne({ nombre: "medio" });
  if (!tarifa) {
    throw new Error("No existe la tarifa 'medio' — corré primero: npm run seed:tarifas");
  }

  const precioPastillas = await precioPastillasModel.findOne();
  if (!precioPastillas) {
    throw new Error("No existe el precio de pastillas — corré primero: npm run seed:pastillas");
  }

  const clientes = {};
  for (const nombre of ["Cliente Prueba A", "Cliente Prueba B", "Cliente Prueba C"]) {
    clientes[nombre] = await clienteModel.findOneAndUpdate(
      { nombre },
      { nombre, tarifaLimpieza: tarifa._id, semana: "todas" },
      { upsert: true, returnDocument: "after" }
    );
  }
  const [A, B, C] = ["Cliente Prueba A", "Cliente Prueba B", "Cliente Prueba C"].map(
    (nombre) => clientes[nombre]._id
  );

  const hoy = hoyNormalizado();
  const fechas = {
    semanaActual: hoy,
    semanaPasada: diasAntes(hoy, 7),
    tresSemanasAtras: diasAntes(hoy, 21),
    mesPasado: mesPasadoDia(hoy, 10),
  };

  const upsertLimpieza = (cliente, fecha, realizada, extra = 0) =>
    limpiezaModel.findOneAndUpdate(
      { cliente, fecha },
      { tarifa: tarifa._id, precioUnitarioUsado: tarifa.precio, extra, realizada },
      { upsert: true, runValidators: true, returnDocument: "after" }
    );

  const upsertPastillas = (cliente, fecha, cantidad) =>
    usoPastillasModel.findOneAndUpdate(
      { cliente, fecha },
      { cantidad, precioUnitarioUsado: precioPastillas.precio },
      { upsert: true, runValidators: true, returnDocument: "after" }
    );

  const upsertProducto = (cliente, fecha, nombreProducto, precioUnitario) =>
    usoProductoModel.findOneAndUpdate(
      { cliente, fecha },
      { nombreProducto, precioUnitario },
      { upsert: true, runValidators: true, returnDocument: "after" }
    );

  // Semana actual
  await upsertLimpieza(A, fechas.semanaActual, true);
  await upsertLimpieza(B, fechas.semanaActual, true, 500);
  await upsertLimpieza(C, fechas.semanaActual, false); // no realizada: no debe sumar
  await upsertPastillas(A, fechas.semanaActual, 3);
  await upsertPastillas(B, fechas.semanaActual, 2);
  await upsertProducto(A, fechas.semanaActual, "Cloro", 3000);
  await upsertProducto(B, fechas.semanaActual, "Algicida", 4000);

  // Semana pasada
  await upsertLimpieza(A, fechas.semanaPasada, true);
  await upsertLimpieza(C, fechas.semanaPasada, true);
  await upsertPastillas(C, fechas.semanaPasada, 4);
  await upsertProducto(A, fechas.semanaPasada, "Cloro", 3000);

  // Tres semanas atrás
  await upsertLimpieza(B, fechas.tresSemanasAtras, true);
  await upsertPastillas(A, fechas.tresSemanasAtras, 1);
  await upsertProducto(C, fechas.tresSemanasAtras, "Algicida", 4000);

  // Mes pasado
  await upsertLimpieza(A, fechas.mesPasado, true);
  await upsertLimpieza(B, fechas.mesPasado, true);
  await upsertLimpieza(C, fechas.mesPasado, true);
  await upsertPastillas(B, fechas.mesPasado, 5);
  await upsertProducto(B, fechas.mesPasado, "Cloro", 3000);
  await upsertProducto(C, fechas.mesPasado, "Pastilla multiacción", 6000);

  console.log("Eventos de prueba cargados correctamente. Fechas usadas:");
  for (const [clave, fecha] of Object.entries(fechas)) {
    console.log(` - ${clave}: ${fecha.toISOString().slice(0, 10)}`);
  }

  await mongoose.disconnect();
};

seedEventosPrueba().catch((error) => {
  console.error("Error al cargar eventos de prueba:", error);
  process.exit(1);
});
