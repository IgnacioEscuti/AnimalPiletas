import { Router } from "express";
import { createUsoPastillas, getUsosPastillas } from "../controllers/usoPastillas.controllers.js";

const router = Router();

router.post("/", createUsoPastillas);
router.get("/", getUsosPastillas);

export default router;
