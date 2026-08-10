import { Router } from "express";
import {
  createCliente,
  getClientes,
  getCliente,
  updateCliente,
} from "../controllers/cliente.controllers.js";

const router = Router();

router.post("/", createCliente);
router.get("/", getClientes);
router.get("/:id", getCliente);
router.put("/:id", updateCliente);

export default router;
