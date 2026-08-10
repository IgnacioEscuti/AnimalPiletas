import { Router } from "express";
import { createLimpieza, getLimpiezas } from "../controllers/limpieza.controllers.js";

const router = Router();

router.post("/", createLimpieza);
router.get("/", getLimpiezas);

export default router;
