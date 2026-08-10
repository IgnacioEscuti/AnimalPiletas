import { Router } from "express";
import { getTarifas, updateTarifa } from "../controllers/tarifaLimpieza.controllers.js";

const router = Router();

router.get("/", getTarifas);
router.put("/:id", updateTarifa);

export default router;
