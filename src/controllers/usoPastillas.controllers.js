import { usoPastillasService } from "../services/usoPastillas.service.js";
import { UsoPastillasDTO } from "../DTOs/usoPastillas.dto.js";

export async function createUsoPastillas(req, res, next) {
  try {
    const { clienteId, cantidad, empleado } = req.body;
    const usoPastillas = await usoPastillasService.registrarUso(clienteId, cantidad, empleado);
    res.status(201).json({ usoPastillas: new UsoPastillasDTO(usoPastillas) });
  } catch (error) {
    next(error);
  }
}

export async function getUsosPastillas(req, res, next) {
  try {
    const usos = await usoPastillasService.getUsosPorFecha(req.query.fecha);
    res.status(200).json({ usosPastillas: usos.map((uso) => new UsoPastillasDTO(uso)) });
  } catch (error) {
    next(error);
  }
}
