import { Router } from "express";
import {
  createLimpiezaAdicional,
  getLimpiezasAdicionales,
  deleteLimpiezaAdicional,
} from "../controllers/limpiezaAdicional.controllers.js";

const router = Router();

router.post("/", createLimpiezaAdicional);
router.get("/", getLimpiezasAdicionales);
router.delete("/:id", deleteLimpiezaAdicional);

export default router;
