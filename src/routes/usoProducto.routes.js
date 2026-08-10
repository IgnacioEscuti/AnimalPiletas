import { Router } from "express";
import { createUsoProducto, getUsosProducto } from "../controllers/usoProducto.controllers.js";

const router = Router();

router.post("/", createUsoProducto);
router.get("/", getUsosProducto);

export default router;
