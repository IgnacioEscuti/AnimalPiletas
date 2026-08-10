import { usoProductoService } from "../services/usoProducto.service.js";
import { UsoProductoDTO } from "../DTOs/usoProducto.dto.js";

export async function createUsoProducto(req, res, next) {
  try {
    const { clienteId, nombreProducto, precioUnitario } = req.body;
    const usoProducto = await usoProductoService.registrarUso(clienteId, nombreProducto, precioUnitario);
    res.status(201).json({ usoProducto: new UsoProductoDTO(usoProducto) });
  } catch (error) {
    next(error);
  }
}

export async function getUsosProducto(req, res, next) {
  try {
    const usos = await usoProductoService.getUsosPorFecha(req.query.fecha);
    res.status(200).json({ usosProducto: usos.map((uso) => new UsoProductoDTO(uso)) });
  } catch (error) {
    next(error);
  }
}
