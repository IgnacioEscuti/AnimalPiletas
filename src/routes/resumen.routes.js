import { Router } from "express";
import { getResumen } from "../controllers/resumen.controllers.js";

const router = Router();

router.get("/", getResumen);

export default router;
