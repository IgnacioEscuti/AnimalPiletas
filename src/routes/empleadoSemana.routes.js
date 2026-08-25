import { Router } from "express";
import { createEmpleadoSemana, getEmpleadosSemana } from "../controllers/empleadoSemana.controllers.js";

const router = Router();

router.post("/", createEmpleadoSemana);
router.get("/", getEmpleadosSemana);

export default router;
