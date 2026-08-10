import { precioPastillasService } from "../services/precioPastillas.service.js";
import { PrecioPastillasDTO } from "../DTOs/precioPastillas.dto.js";

export async function getPrecioPastillas(req, res, next) {
  try {
    const precioPastillas = await precioPastillasService.getPrecio();
    res.status(200).json({ precioPastillas: new PrecioPastillasDTO(precioPastillas) });
  } catch (error) {
    next(error);
  }
}

export async function updatePrecioPastillas(req, res, next) {
  try {
    const precioPastillas = await precioPastillasService.updatePrecio(req.body.precio);
    res.status(200).json({ precioPastillas: new PrecioPastillasDTO(precioPastillas) });
  } catch (error) {
    next(error);
  }
}
