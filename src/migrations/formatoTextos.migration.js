import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { connectDB } from "../config/database.js";
import { clienteModel } from "../models/cliente.model.js";
import { barrioModel } from "../models/barrio.model.js";
import { tarifaLimpiezaModel } from "../models/tarifaLimpieza.model.js";
import { usuarioModel } from "../models/usuario.model.js";
import { limpiezaModel } from "../models/limpieza.model.js";
import { usoPastillasModel } from "../models/usoPastillas.model.js";
import { usoExtraModel } from "../models/usoExtra.model.js";
import { limpiezaAdicionalModel } from "../models/limpiezaAdicional.model.js";
import { empleadoSemanaModel } from "../models/empleadoSemana.model.js";
import { formatearNombre, formatearExtra, formatearTarifa } from "../utils/formato.utils.js";

// Migración de una sola corrida: aplica "Formato de textos" (ver PLAN.md) a
// los datos que ya estaban en la base.
//
//   npm run migrate:formato-textos                      -> solo simula y lista los cambios
//   npm run migrate:formato-textos -- --apply           -> backup + escribe
//   npm run migrate:formato-textos -- --revert <carpeta> -> vuelve a los valores de cambios.json
//
// Escribe sobre la colección nativa (no el modelo de Mongoose) para que no
// se actualice updatedAt. Nunca borra documentos.

const { EJSON } = mongoose.mongo.BSON;
const CARPETA_BACKUPS = fileURLToPath(new URL("../../backups/", import.meta.url));

// En este orden se listan los cambios: clientes primero. campoUnico marca el
// campo donde dos documentos no pueden terminar con el mismo valor.
const COLECCIONES = [
  { model: clienteModel, campos: { nombre: formatearNombre, direccion: formatearNombre }, campoUnico: "nombre" },
  { model: barrioModel, campos: { nombre: formatearNombre }, campoUnico: "nombre" },
  { model: tarifaLimpiezaModel, campos: { nombre: formatearTarifa }, campoUnico: "nombre" },
  { model: usuarioModel, campos: { nombre: formatearNombre } },
  { model: limpiezaModel, campos: { empleado: formatearNombre } },
  { model: usoPastillasModel, campos: { empleado: formatearNombre } },
  { model: usoExtraModel, campos: { nombreExtra: formatearExtra, empleado: formatearNombre } },
  { model: limpiezaAdicionalModel, campos: { empleado: formatearNombre }, conExtras: true },
  { model: empleadoSemanaModel, campos: { nombre: formatearNombre } },
];

function camposDe(doc, { campos, conExtras }) {
  const lista = Object.entries(campos).map(([campo, formatear]) => ({
    campo,
    antes: doc[campo],
    formatear,
  }));
  if (conExtras) {
    doc.extras?.forEach((item, i) => {
      lista.push({ campo: `extras.${i}.nombre`, antes: item?.nombre, formatear: formatearExtra });
    });
  }
  return lista;
}

// Si dos documentos quedarían con el mismo nombre (ej. "juan perez" y
// "Juan Perez"), no se toca ninguno de los dos y se informan. Los grupos
// que ya eran iguales antes de formatear no cuentan: la migración no los cambia.
function buscarColisiones(docs, { campos, campoUnico }) {
  const porNombre = new Map();
  for (const doc of docs) {
    if (typeof doc[campoUnico] !== "string") continue;
    const nombre = campos[campoUnico](doc[campoUnico]);
    if (!porNombre.has(nombre)) porNombre.set(nombre, []);
    porNombre.get(nombre).push(doc);
  }

  const colisiones = [];
  for (const [nombre, grupo] of porNombre) {
    if (grupo.length < 2 || grupo.every((doc) => doc[campoUnico] === nombre)) continue;
    colisiones.push({ nombre, documentos: grupo.map((doc) => ({ _id: doc._id, antes: doc[campoUnico] })) });
  }
  return colisiones;
}

async function calcularCambios(db) {
  const cambios = [];
  const colisiones = [];

  for (const config of COLECCIONES) {
    const coleccion = config.model.collection.name;
    const docs = await db.collection(coleccion).find().toArray();

    const idsConColision = new Set();
    if (config.campoUnico) {
      for (const colision of buscarColisiones(docs, config)) {
        colisiones.push({ coleccion, ...colision });
        colision.documentos.forEach((doc) => idsConColision.add(doc._id.toString()));
      }
    }

    for (const doc of docs) {
      if (idsConColision.has(doc._id.toString())) continue;
      for (const { campo, antes, formatear } of camposDe(doc, config)) {
        // Campos que no existen o son null (ej. Usuario.nombre) se dejan como están.
        if (typeof antes !== "string") continue;
        const despues = formatear(antes);
        if (despues !== antes) cambios.push({ coleccion, _id: doc._id, campo, antes, despues });
      }
    }
  }

  return { cambios, colisiones };
}

function listar({ cambios, colisiones }) {
  console.log(`\nCambios (${cambios.length}):`);
  for (const { coleccion, _id, campo, antes, despues } of cambios) {
    console.log(`  ${coleccion}  ${_id}  ${campo}: ${JSON.stringify(antes)} → ${JSON.stringify(despues)}`);
  }

  console.log(`\nColisiones (${colisiones.length}) — no se tocan:`);
  for (const { coleccion, nombre, documentos } of colisiones) {
    console.log(`  ${coleccion}  quedarían como ${JSON.stringify(nombre)}:`);
    for (const { _id, antes } of documentos) console.log(`    ${_id}  ${JSON.stringify(antes)}`);
  }
}

// Exporta todas las colecciones en EJSON canónico (conserva ObjectId y Date)
// y comprueba que el archivo tenga la misma cantidad de documentos que la
// base. Si algo no coincide, tira error y la migración corta sin escribir.
async function exportarBackup(db, carpeta) {
  await fs.mkdir(carpeta, { recursive: true });
  const colecciones = await db.listCollections({}, { nameOnly: true }).toArray();

  console.log(`\nBackup en ${carpeta}`);
  for (const { name, type } of colecciones) {
    if (type === "view" || name.startsWith("system.")) continue;

    const coleccion = db.collection(name);
    const archivo = path.join(carpeta, `${name}.json`);
    await fs.writeFile(archivo, EJSON.stringify(await coleccion.find().toArray(), { relaxed: false }));

    const enArchivo = EJSON.parse(await fs.readFile(archivo, "utf8")).length;
    const enBase = await coleccion.countDocuments();
    if (enArchivo !== enBase) {
      throw new Error(`Backup de ${name}: ${enArchivo} documentos en el archivo y ${enBase} en la base`);
    }
    console.log(`  ${name}: ${enBase} documentos`);
  }
}

async function aplicar(db) {
  const carpeta = path.join(CARPETA_BACKUPS, new Date().toISOString().slice(0, 19).replace(/:/g, "-"));
  await exportarBackup(db, carpeta);

  const resultado = await calcularCambios(db);
  listar(resultado);

  await fs.writeFile(
    path.join(carpeta, "cambios.json"),
    EJSON.stringify({ cambios: resultado.cambios }, null, 2, { relaxed: false })
  );

  // El filtro incluye el valor de antes: si alguien editó el documento
  // mientras corría la migración, no se pisa su cambio.
  let aplicados = 0;
  for (const { coleccion, _id, campo, antes, despues } of resultado.cambios) {
    const { matchedCount } = await db
      .collection(coleccion)
      .updateOne({ _id, [campo]: antes }, { $set: { [campo]: despues } });
    if (matchedCount) aplicados++;
    else console.log(`  Salteado (cambió mientras tanto): ${coleccion} ${_id} ${campo}`);
  }

  console.log(`\nAplicados ${aplicados} de ${resultado.cambios.length} cambios. Backup: ${carpeta}`);
}

async function revertir(db, carpeta) {
  const { cambios } = EJSON.parse(await fs.readFile(path.join(carpeta, "cambios.json"), "utf8"));

  // Solo se revierte si el campo sigue con el valor que puso la migración.
  let revertidos = 0;
  for (const { coleccion, _id, campo, antes, despues } of cambios) {
    const { matchedCount } = await db
      .collection(coleccion)
      .updateOne({ _id, [campo]: despues }, { $set: { [campo]: antes } });
    if (matchedCount) revertidos++;
    else console.log(`  Salteado (se editó después de migrar): ${coleccion} ${_id} ${campo}`);
  }

  console.log(`\nRevertidos ${revertidos} de ${cambios.length} cambios.`);
}

const migrar = async () => {
  const args = process.argv.slice(2);
  const indiceRevert = args.indexOf("--revert");
  if (indiceRevert !== -1 && !args[indiceRevert + 1]) {
    throw new Error("Falta la carpeta: --revert backups/<fecha>");
  }

  await connectDB();
  const { db, host, name } = mongoose.connection;
  console.log(`Base: ${host} / ${name}`);

  if (indiceRevert !== -1) {
    await revertir(db, args[indiceRevert + 1]);
  } else if (args.includes("--apply")) {
    await aplicar(db);
  } else {
    console.log("Simulación: no se escribe nada. Para aplicar: --apply");
    listar(await calcularCambios(db));
  }

  await mongoose.disconnect();
};

migrar().catch(async (error) => {
  console.error("Error en la migración:", error);
  await mongoose.disconnect();
  process.exit(1);
});
