import { Router } from "express";
import { createUsoExtra, getUsosExtra } from "../controllers/usoExtra.controllers.js";

const router = Router();

router.post("/", createUsoExtra);
router.get("/", getUsosExtra);

export default router;
