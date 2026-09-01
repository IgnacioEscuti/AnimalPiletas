import { Router } from "express";
import {
  getTarifas,
  createTarifa,
  updateTarifa,
  deleteTarifa,
} from "../controllers/tarifaLimpieza.controllers.js";

const router = Router();

router.get("/", getTarifas);
router.post("/", createTarifa);
router.put("/:id", updateTarifa);
router.delete("/:id", deleteTarifa);

export default router;
