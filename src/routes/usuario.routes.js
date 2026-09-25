import { Router } from "express";
import {
  getUsuarios,
  getPendientes,
  aprobarPendiente,
  rechazarPendiente,
} from "../controllers/usuario.controllers.js";

const router = Router();

router.get("/", getUsuarios);
router.get("/pendientes", getPendientes);
router.patch("/pendientes/:id/aprobar", aprobarPendiente);
router.delete("/pendientes/:id", rechazarPendiente);

export default router;
