import { Router } from "express";
import {
  createCliente,
  getClientes,
  getCliente,
  updateCliente,
  reordenarClientesEnBarrio,
} from "../controllers/cliente.controllers.js";

const router = Router();

router.post("/", createCliente);
router.get("/", getClientes);
router.put("/reordenar-en-barrio", reordenarClientesEnBarrio);
router.get("/:id", getCliente);
router.put("/:id", updateCliente);

export default router;
