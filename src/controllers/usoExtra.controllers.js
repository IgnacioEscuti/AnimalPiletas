import { usoExtraService } from "../services/usoExtra.service.js";
import { UsoExtraDTO } from "../DTOs/usoExtra.dto.js";

export async function createUsoExtra(req, res, next) {
  try {
    const { clienteId, nombreExtra, precioUnitario, empleado } = req.body;
    const usoExtra = await usoExtraService.registrarUso(
      clienteId,
      nombreExtra,
      precioUnitario,
      empleado
    );
    res.status(201).json({ usoExtra: new UsoExtraDTO(usoExtra) });
  } catch (error) {
    next(error);
  }
}

export async function getUsosExtra(req, res, next) {
  try {
    const usos = await usoExtraService.getUsosPorFecha(req.query.fecha);
    res.status(200).json({ usosExtra: usos.map((uso) => new UsoExtraDTO(uso)) });
  } catch (error) {
    next(error);
  }
}

export async function deleteUsoExtra(req, res, next) {
  try {
    await usoExtraService.eliminarUso(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
