import { clienteRepository } from "../repositories/cliente.repository.js";
import { limpiezaRepository } from "../repositories/limpieza.repository.js";
import { usoPastillasRepository } from "../repositories/usoPastillas.repository.js";
import { usoExtraRepository } from "../repositories/usoExtra.repository.js";
import { empleadoSemanaRepository } from "../repositories/empleadoSemana.repository.js";
import { rangoSemanal, rangoMensual } from "../utils/fecha.utils.js";

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
    empleadoSemanaRepository
  ) {
    this.clienteRepository = clienteRepository;
    this.limpiezaRepository = limpiezaRepository;
    this.usoPastillasRepository = usoPastillasRepository;
    this.usoExtraRepository = usoExtraRepository;
    this.empleadoSemanaRepository = empleadoSemanaRepository;
  }

  async getResumen(tipo, fecha, usuarioActual) {
    if (tipo !== "semanal" && tipo !== "mensual") {
      const error = new Error("el tipo debe ser 'semanal' o 'mensual'");
      error.statusCode = 400;
      throw error;
    }

    const { inicio, fin } = tipo === "semanal" ? rangoSemanal(fecha) : rangoMensual(fecha);
    const filtroFecha = { fecha: { $gte: inicio, $lt: fin } };
    const filtroWeekStart = { weekStart: { $gte: inicio, $lt: fin } };
    // Igual que en la pantalla de Cliente: un "encargado" solo ve sus propios
    // clientes, un "admin" ve todos. Alcanza con filtrar la lista de clientes
    // acá — como las filas del resumen se arman iterando esa lista, los
    // eventos de clientes ajenos nunca terminan en la respuesta.
    const filtroClientes =
      usuarioActual.rol === "encargado" ? { encargado: usuarioActual.id ?? usuarioActual._id } : {};

    const [clientes, limpiezas, usosPastillas, usosExtra, empleadosSemana] = await Promise.all([
      this.clienteRepository.findSoloNombre(filtroClientes),
      this.limpiezaRepository.find(filtroFecha),
      this.usoPastillasRepository.find(filtroFecha),
      this.usoExtraRepository.find(filtroFecha),
      this.empleadoSemanaRepository.find(filtroWeekStart),
    ]);

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
      clientes: filas,
      totales: { totalLimpiezas, totalPastillas, totalExtras },
    };
  }
}

export const resumenService = new ResumenService(
  clienteRepository,
  limpiezaRepository,
  usoPastillasRepository,
  usoExtraRepository,
  empleadoSemanaRepository
);
