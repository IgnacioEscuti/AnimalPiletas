import { clienteRepository } from "../repositories/cliente.repository.js";
import { limpiezaRepository } from "../repositories/limpieza.repository.js";
import { usoPastillasRepository } from "../repositories/usoPastillas.repository.js";
import { usoExtraRepository } from "../repositories/usoExtra.repository.js";
import { empleadoSemanaRepository } from "../repositories/empleadoSemana.repository.js";
import { barrioRepository } from "../repositories/barrio.repository.js";
import { rangoSemanal, rangoMensual } from "../utils/fecha.utils.js";
import { handleMongooseError } from "../utils/mongooseError.utils.js";

const SIN_BARRIO = "sin-barrio";

// Mismo criterio de "Sin barrio" (agrupado al final, orden del catálogo
// para el resto) que ya usa la pantalla de Cliente. Se aplica siempre,
// sin importar si el admin eligió "Todos" o un encargado puntual — el
// filtro de encargado ya se resolvió antes, a nivel de consulta.
function agruparPorBarrio(filas, barrios) {
  const porBarrio = new Map();
  for (const fila of filas) {
    const key = fila._barrioId ?? SIN_BARRIO;
    if (!porBarrio.has(key)) porBarrio.set(key, []);
    porBarrio.get(key).push(fila);
  }

  const grupos = barrios
    .filter((barrio) => porBarrio.has(barrio.id))
    .map((barrio) => ({
      barrioId: barrio.id,
      barrioNombre: barrio.nombre,
      clientes: porBarrio.get(barrio.id),
    }));

  if (porBarrio.has(SIN_BARRIO)) {
    grupos.push({
      barrioId: SIN_BARRIO,
      barrioNombre: "Sin barrio",
      clientes: porBarrio.get(SIN_BARRIO),
    });
  }

  return grupos;
}

function datosVacios() {
  return {
    limpiezaCantidad: 0,
    limpiezaPrecio: 0,
    limpiezaFechas: [],
    pastillasCantidad: 0,
    pastillasPrecio: 0,
    extras: new Map(),
    extraPrecio: 0,
    empleados: new Set(),
  };
}

export class ResumenService {
  constructor(
    clienteRepository,
    limpiezaRepository,
    usoPastillasRepository,
    usoExtraRepository,
    empleadoSemanaRepository,
    barrioRepository
  ) {
    this.clienteRepository = clienteRepository;
    this.limpiezaRepository = limpiezaRepository;
    this.usoPastillasRepository = usoPastillasRepository;
    this.usoExtraRepository = usoExtraRepository;
    this.empleadoSemanaRepository = empleadoSemanaRepository;
    this.barrioRepository = barrioRepository;
  }

  async getResumen(tipo, fecha, usuarioActual, encargadoId) {
    if (tipo !== "semanal" && tipo !== "mensual") {
      const error = new Error("el tipo debe ser 'semanal' o 'mensual'");
      error.statusCode = 400;
      throw error;
    }

    const { inicio, fin } = tipo === "semanal" ? rangoSemanal(fecha) : rangoMensual(fecha);
    const filtroFecha = { fecha: { $gte: inicio, $lt: fin } };
    const filtroWeekStart = { weekStart: { $gte: inicio, $lt: fin } };

    // Igual que en la pantalla de Cliente: un "encargado" solo ve sus propios
    // clientes, sin importar qué venga en encargadoId. Un admin puede filtrar
    // a un encargado puntual (cualquiera sea su rol), o dejarlo en "Todos"
    // para traer los clientes de todos, mezclados en las mismas secciones
    // de barrio — el resumen nunca agrupa por encargado.
    let filtroClientes = {};
    if (usuarioActual.rol === "encargado") {
      filtroClientes = { encargado: usuarioActual.id ?? usuarioActual._id };
    } else if (encargadoId) {
      filtroClientes = { encargado: encargadoId };
    }

    let clientes, limpiezas, usosPastillas, usosExtra, empleadosSemana, barrios;
    try {
      [clientes, limpiezas, usosPastillas, usosExtra, empleadosSemana, barrios] = await Promise.all([
        this.clienteRepository.findSoloNombre(filtroClientes),
        this.limpiezaRepository.find(filtroFecha),
        this.usoPastillasRepository.find(filtroFecha),
        this.usoExtraRepository.find(filtroFecha),
        this.empleadoSemanaRepository.find(filtroWeekStart),
        this.barrioRepository.find(),
      ]);
    } catch (error) {
      handleMongooseError(error);
    }

    const porCliente = new Map();
    const datosDe = (clienteId) => {
      const id = clienteId.toString();
      if (!porCliente.has(id)) porCliente.set(id, datosVacios());
      return porCliente.get(id);
    };

    // Una limpieza "no realizada" (cruz) no se cobra ni se cuenta.
    for (const limpieza of limpiezas) {
      if (limpieza.realizada) {
        const datos = datosDe(limpieza.cliente);
        datos.limpiezaCantidad += 1;
        datos.limpiezaPrecio += limpieza.precioUnitarioUsado + limpieza.extra;
        datos.limpiezaFechas.push(limpieza.fecha);
      }
    }

    for (const uso of usosPastillas) {
      const datos = datosDe(uso.cliente);
      datos.pastillasCantidad += uso.cantidad;
      datos.pastillasPrecio += uso.cantidad * uso.precioUnitarioUsado;
    }

    for (const uso of usosExtra) {
      const datos = datosDe(uso.cliente);
      datos.extras.set(uso.nombreExtra, (datos.extras.get(uso.nombreExtra) ?? 0) + 1);
      datos.extraPrecio += uso.precioUnitario;
    }

    for (const empleadoSemana of empleadosSemana) {
      if (empleadoSemana.nombre) datosDe(empleadoSemana.cliente).empleados.add(empleadoSemana.nombre);
    }

    const filas = clientes.map((cliente) => {
      const datos = porCliente.get(cliente.id) ?? datosVacios();
      const extra = {
        extras: Array.from(datos.extras, ([nombre, cantidad]) => ({ nombre, cantidad })),
        precio: datos.extraPrecio,
      };
      const totalGeneral = datos.limpiezaPrecio + datos.pastillasPrecio + datos.extraPrecio;

      return {
        clienteId: cliente.id,
        clienteNombre: cliente.nombre,
        _barrioId: cliente.barrio ? cliente.barrio.toString() : null,
        limpieza: {
          cantidad: datos.limpiezaCantidad,
          precio: datos.limpiezaPrecio,
          fechas: [...datos.limpiezaFechas].sort((a, b) => a - b),
        },
        pastillas: { cantidad: datos.pastillasCantidad, precio: datos.pastillasPrecio },
        extra,
        empleados: Array.from(datos.empleados).join(", "),
        totalGeneral,
      };
    });

    let totalLimpiezas = 0;
    let totalPastillas = 0;
    const totalExtrasMap = new Map();
    for (const fila of filas) {
      totalLimpiezas += fila.limpieza.cantidad;
      totalPastillas += fila.pastillas.cantidad;
      for (const { nombre, cantidad } of fila.extra.extras) {
        totalExtrasMap.set(nombre, (totalExtrasMap.get(nombre) ?? 0) + cantidad);
      }
    }
    const totalExtras = Array.from(totalExtrasMap, ([nombre, cantidad]) => ({ nombre, cantidad }));

    return {
      inicio,
      fin,
      grupos: agruparPorBarrio(filas, barrios),
      totales: { totalLimpiezas, totalPastillas, totalExtras },
    };
  }
}

export const resumenService = new ResumenService(
  clienteRepository,
  limpiezaRepository,
  usoPastillasRepository,
  usoExtraRepository,
  empleadoSemanaRepository,
  barrioRepository
);
