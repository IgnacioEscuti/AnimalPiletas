import { Router } from "express";
import { getUsuarios } from "../controllers/usuario.controllers.js";

const router = Router();

router.get("/", getUsuarios);

export default router;
