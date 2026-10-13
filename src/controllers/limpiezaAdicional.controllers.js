import { limpiezaAdicionalService } from "../services/limpiezaAdicional.service.js";
import { LimpiezaAdicionalDTO } from "../DTOs/limpiezaAdicional.dto.js";

export async function createLimpiezaAdicional(req, res, next) {
  try {
    const { cliente, extra, cantidadPastillas, extras } = req.body;
    const adicional = await limpiezaAdicionalService.registrar(
      { cliente, extra, cantidadPastillas, extras },
      req.usuario
    );
    res.status(201).json({ limpiezaAdicional: new LimpiezaAdicionalDTO(adicional) });
  } catch (error) {
    next(error);
  }
}

export async function getLimpiezasAdicionales(req, res, next) {
  try {
    const adicionales = await limpiezaAdicionalService.getDeEstaSemana(req.query.cliente, req.usuario);
    res.status(200).json({
      limpiezasAdicionales: adicionales.map((adicional) => new LimpiezaAdicionalDTO(adicional)),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteLimpiezaAdicional(req, res, next) {
  try {
    await limpiezaAdicionalService.eliminar(req.params.id, req.usuario);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
