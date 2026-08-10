import { Router } from "express";
import { getPrecioPastillas, updatePrecioPastillas } from "../controllers/precioPastillas.controllers.js";

const router = Router();

router.get("/", getPrecioPastillas);
router.put("/", updatePrecioPastillas);

export default router;
