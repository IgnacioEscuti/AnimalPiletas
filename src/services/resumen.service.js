import { clienteRepository } from "../repositories/cliente.repository.js";
import { limpiezaRepository } from "../repositories/limpieza.repository.js";
import { usoPastillasRepository } from "../repositories/usoPastillas.repository.js";
import { usoProductoRepository } from "../repositories/usoProducto.repository.js";
import { rangoSemanal, rangoMensual } from "../utils/fecha.utils.js";

function datosVacios() {
  return {
    limpiezaCantidad: 0,
    limpiezaPrecio: 0,
    pastillasCantidad: 0,
    pastillasPrecio: 0,
    productos: new Map(),
    productoPrecio: 0,
  };
}

export class ResumenService {
  constructor(clienteRepository, limpiezaRepository, usoPastillasRepository, usoProductoRepository) {
    this.clienteRepository = clienteRepository;
    this.limpiezaRepository = limpiezaRepository;
    this.usoPastillasRepository = usoPastillasRepository;
    this.usoProductoRepository = usoProductoRepository;
  }

  async getResumen(tipo, fecha) {
    if (tipo !== "semanal" && tipo !== "mensual") {
      const error = new Error("el tipo debe ser 'semanal' o 'mensual'");
      error.statusCode = 400;
      throw error;
    }

    const { inicio, fin } = tipo === "semanal" ? rangoSemanal(fecha) : rangoMensual(fecha);
    const filtroFecha = { fecha: { $gte: inicio, $lt: fin } };

    const [clientes, limpiezas, usosPastillas, usosProducto] = await Promise.all([
      this.clienteRepository.find(),
      this.limpiezaRepository.find(filtroFecha),
      this.usoPastillasRepository.find(filtroFecha),
      this.usoProductoRepository.find(filtroFecha),
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
      }
    }

    for (const uso of usosPastillas) {
      const datos = datosDe(uso.cliente);
      datos.pastillasCantidad += uso.cantidad;
      datos.pastillasPrecio += uso.cantidad * uso.precioUnitarioUsado;
    }

    for (const uso of usosProducto) {
      const datos = datosDe(uso.cliente);
      datos.productos.set(uso.nombreProducto, (datos.productos.get(uso.nombreProducto) ?? 0) + 1);
      datos.productoPrecio += uso.precioUnitario;
    }

    const filas = clientes.map((cliente) => {
      const datos = porCliente.get(cliente.id) ?? datosVacios();
      const producto = {
        productos: Array.from(datos.productos, ([nombre, cantidad]) => ({ nombre, cantidad })),
        precio: datos.productoPrecio,
      };
      const totalGeneral = datos.limpiezaPrecio + datos.pastillasPrecio + datos.productoPrecio;

      return {
        clienteId: cliente.id,
        clienteNombre: cliente.nombre,
        limpieza: { cantidad: datos.limpiezaCantidad, precio: datos.limpiezaPrecio },
        pastillas: { cantidad: datos.pastillasCantidad, precio: datos.pastillasPrecio },
        producto,
        totalGeneral,
      };
    });

    let totalLimpiezas = 0;
    let totalPastillas = 0;
    const totalProductosMap = new Map();
    for (const fila of filas) {
      totalLimpiezas += fila.limpieza.cantidad;
      totalPastillas += fila.pastillas.cantidad;
      for (const { nombre, cantidad } of fila.producto.productos) {
        totalProductosMap.set(nombre, (totalProductosMap.get(nombre) ?? 0) + cantidad);
      }
    }
    const totalProductos = Array.from(totalProductosMap, ([nombre, cantidad]) => ({ nombre, cantidad }));

    return {
      inicio,
      fin,
      clientes: filas,
      totales: { totalLimpiezas, totalPastillas, totalProductos },
    };
  }
}

export const resumenService = new ResumenService(
  clienteRepository,
  limpiezaRepository,
  usoPastillasRepository,
  usoProductoRepository
);
