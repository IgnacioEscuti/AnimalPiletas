import { resumenService } from "../services/resumen.service.js";
import { ResumenClienteDTO } from "../DTOs/resumenCliente.dto.js";
import { ResumenTotalesDTO } from "../DTOs/resumenTotales.dto.js";

export async function getResumen(req, res, next) {
  try {
    const { tipo, fecha } = req.query;
    const resumen = await resumenService.getResumen(tipo, fecha, req.usuario);
    res.status(200).json({
      inicio: resumen.inicio,
      fin: resumen.fin,
      clientes: resumen.clientes.map((cliente) => new ResumenClienteDTO(cliente)),
      totales: new ResumenTotalesDTO(resumen.totales),
    });
  } catch (error) {
    next(error);
  }
}
