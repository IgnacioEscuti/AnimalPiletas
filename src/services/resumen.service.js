import { clienteRepository } from "../repositories/cliente.repository.js";
import { limpiezaRepository } from "../repositories/limpieza.repository.js";
import { usoPastillasRepository } from "../repositories/usoPastillas.repository.js";
import { usoExtraRepository } from "../repositories/usoExtra.repository.js";
import { empleadoSemanaRepository } from "../repositories/empleadoSemana.repository.js";
import { limpiezaAdicionalRepository } from "../repositories/limpiezaAdicional.repository.js";
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
    barrioRepository,
    limpiezaAdicionalRepository
  ) {
    this.clienteRepository = clienteRepository;
    this.limpiezaRepository = limpiezaRepository;
    this.usoPastillasRepository = usoPastillasRepository;
    this.usoExtraRepository = usoExtraRepository;
    this.empleadoSemanaRepository = empleadoSemanaRepository;
    this.barrioRepository = barrioRepository;
    this.limpiezaAdicionalRepository = limpiezaAdicionalRepository;
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
    //
    // Las limpiezas adicionales usan el mismo usuario, pero filtrando por
    // quién las cargó (cargadoPor), no por el encargado del cliente.
    let filtroClientes = {};
    const filtroAdicionales = { ...filtroFecha };
    if (usuarioActual.rol === "encargado") {
      filtroClientes = { encargado: usuarioActual.id ?? usuarioActual._id };
      filtroAdicionales.cargadoPor = usuarioActual.id ?? usuarioActual._id;
    } else if (encargadoId) {
      filtroClientes = { encargado: encargadoId };
      filtroAdicionales.cargadoPor = encargadoId;
    }

    let clientes, limpiezas, usosPastillas, usosExtra, empleadosSemana, barrios, adicionales;
    try {
      [clientes, limpiezas, usosPastillas, usosExtra, empleadosSemana, barrios, adicionales] = await Promise.all([
        this.clienteRepository.findSoloNombre(filtroClientes),
        this.limpiezaRepository.find(filtroFecha),
        this.usoPastillasRepository.find(filtroFecha),
        this.usoExtraRepository.find(filtroFecha),
        this.empleadoSemanaRepository.find(filtroWeekStart),
        this.barrioRepository.find(),
        this.limpiezaAdicionalRepository.find(filtroAdicionales),
      ]);
    } catch (error) {
      handleMongooseError(error);
    }

    // Clientes que no están en el filtro de quien mira pero tienen una
    // adicional cargada por él: su fila aparece igual, dentro de su barrio.
    const idsEnFiltro = new Set(clientes.map((cliente) => cliente.id));
    const idsFueraDeFiltro = [
      ...new Set(adicionales.map((adicional) => adicional.cliente._id.toString())),
    ].filter((id) => !idsEnFiltro.has(id));

    let clientesFueraDeFiltro = [];
    if (idsFueraDeFiltro.length > 0) {
      try {
        clientesFueraDeFiltro = await this.clienteRepository.findSoloNombre({
          _id: { $in: idsFueraDeFiltro },
        });
      } catch (error) {
        handleMongooseError(error);
      }
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

    // Limpieza, UsoPastillas, UsoExtra y EmpleadoSemana se traen sin filtrar
    // por cliente: para los clientes fuera del filtro se descarta lo que se
    // acumuló de ellos, así su fila muestra solo lo de la adicional.
    for (const id of idsFueraDeFiltro) {
      porCliente.set(id, datosVacios());
    }

    // Igual que en Limpieza: si no se realizó, la limpieza no se cuenta ni
    // se cobra, pero las pastillas y los extras sí.
    for (const adicional of adicionales) {
      const datos = datosDe(adicional.cliente._id);
      if (adicional.realizada) {
        datos.limpiezaCantidad += 1;
        datos.limpiezaPrecio += adicional.precioUnitarioUsado + adicional.extra;
        datos.limpiezaFechas.push(adicional.fecha);
      }
      datos.pastillasCantidad += adicional.cantidadPastillas;
      datos.pastillasPrecio += adicional.cantidadPastillas * adicional.precioPastillasUsado;
      for (const { nombre, precio } of adicional.extras) {
        datos.extras.set(nombre, (datos.extras.get(nombre) ?? 0) + 1);
        datos.extraPrecio += precio;
      }
      const empleado = adicional.empleado || adicional.cargadoPor?.nombre || adicional.cargadoPor?.email;
      if (empleado) datos.empleados.add(empleado);
    }

    const filas = [...clientes, ...clientesFueraDeFiltro].map((cliente) => {
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

    // En el semanal solo se muestran los clientes con algo cargado esa semana:
    // el resto llenaba la vista de filas en cero. El mensual las muestra todas.
    const filasVisibles =
      tipo === "semanal"
        ? filas.filter(
            (fila) =>
              fila.limpieza.cantidad > 0 ||
              fila.pastillas.cantidad > 0 ||
              fila.extra.extras.length > 0
          )
        : filas;

    let totalLimpiezas = 0;
    let totalPastillas = 0;
    const totalExtrasMap = new Map();
    for (const fila of filasVisibles) {
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
      grupos: agruparPorBarrio(filasVisibles, barrios),
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
  barrioRepository,
  limpiezaAdicionalRepository
);
