import { tarifaLimpiezaService } from "../services/tarifaLimpieza.service.js";
import { TarifaLimpiezaDTO } from "../DTOs/tarifaLimpieza.dto.js";

export async function getTarifas(req, res, next) {
  try {
    const tarifas = await tarifaLimpiezaService.getTarifas();
    res.status(200).json({ tarifas: tarifas.map((tarifa) => new TarifaLimpiezaDTO(tarifa)) });
  } catch (error) {
    next(error);
  }
}

export async function createTarifa(req, res, next) {
  try {
    const tarifa = await tarifaLimpiezaService.createTarifa(req.body.nombre, req.body.precio);
    res.status(201).json({ tarifa: new TarifaLimpiezaDTO(tarifa) });
  } catch (error) {
    next(error);
  }
}

export async function deleteTarifa(req, res, next) {
  try {
    await tarifaLimpiezaService.deleteTarifa(req.params.id);
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
}

export async function updateTarifa(req, res, next) {
  try {
    const tarifa = await tarifaLimpiezaService.updatePrecio(req.params.id, req.body.precio);
    res.status(200).json({ tarifa: new TarifaLimpiezaDTO(tarifa) });
  } catch (error) {
    next(error);
  }
}
