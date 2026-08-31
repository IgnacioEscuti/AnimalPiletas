import { resumenService } from "../services/resumen.service.js";
import { ResumenGrupoBarrioDTO } from "../DTOs/resumenGrupoBarrio.dto.js";
import { ResumenTotalesDTO } from "../DTOs/resumenTotales.dto.js";

export async function getResumen(req, res, next) {
  try {
    const { tipo, fecha, encargadoId } = req.query;
    const resumen = await resumenService.getResumen(tipo, fecha, req.usuario, encargadoId);
    res.status(200).json({
      inicio: resumen.inicio,
      fin: resumen.fin,
      grupos: resumen.grupos.map((grupo) => new ResumenGrupoBarrioDTO(grupo)),
      totales: new ResumenTotalesDTO(resumen.totales),
    });
  } catch (error) {
    next(error);
  }
}
