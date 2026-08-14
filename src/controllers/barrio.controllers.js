import { barrioService } from "../services/barrio.service.js";
import { BarrioDTO } from "../DTOs/barrio.dto.js";

export async function createBarrio(req, res, next) {
  try {
    const barrio = await barrioService.createBarrio(req.body.nombre);
    res.status(201).json({ barrio: new BarrioDTO(barrio) });
  } catch (error) {
    next(error);
  }
}

export async function getBarrios(req, res, next) {
  try {
    const barrios = await barrioService.getBarrios();
    res.status(200).json({ barrios: barrios.map((barrio) => new BarrioDTO(barrio)) });
  } catch (error) {
    next(error);
  }
}

export async function reordenarBarrios(req, res, next) {
  try {
    await barrioService.reordenar(req.body.ids);
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
}
