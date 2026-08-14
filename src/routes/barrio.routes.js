import { Router } from "express";
import { createBarrio, getBarrios, reordenarBarrios } from "../controllers/barrio.controllers.js";

const router = Router();

router.post("/", createBarrio);
router.get("/", getBarrios);
router.put("/reordenar", reordenarBarrios);

export default router;
