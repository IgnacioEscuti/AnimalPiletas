import { empleadoSemanaService } from "../services/empleadoSemana.service.js";
import { EmpleadoSemanaDTO } from "../DTOs/empleadoSemana.dto.js";

export async function createEmpleadoSemana(req, res, next) {
  try {
    const { clienteId, nombre } = req.body;
    const empleadoSemana = await empleadoSemanaService.registrarEmpleado(clienteId, nombre);
    res.status(201).json({ empleadoSemana: new EmpleadoSemanaDTO(empleadoSemana) });
  } catch (error) {
    next(error);
  }
}

export async function getEmpleadosSemana(req, res, next) {
  try {
    const empleados = await empleadoSemanaService.getEmpleadosPorFecha(req.query.fecha);
    res.status(200).json({ empleadosSemana: empleados.map((e) => new EmpleadoSemanaDTO(e)) });
  } catch (error) {
    next(error);
  }
}
