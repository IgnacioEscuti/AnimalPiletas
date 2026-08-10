import { limpiezaService } from "../services/limpieza.service.js";
import { LimpiezaDTO } from "../DTOs/limpieza.dto.js";

export async function createLimpieza(req, res, next) {
  try {
    const { clienteId, realizada, extra } = req.body;
    const limpieza = await limpiezaService.registrarLimpieza(clienteId, realizada, extra);
    res.status(201).json({ limpieza: new LimpiezaDTO(limpieza) });
  } catch (error) {
    next(error);
  }
}

export async function getLimpiezas(req, res, next) {
  try {
    const limpiezas = await limpiezaService.getLimpiezasPorFecha(req.query.fecha);
    res.status(200).json({ limpiezas: limpiezas.map((limpieza) => new LimpiezaDTO(limpieza)) });
  } catch (error) {
    next(error);
  }
}
