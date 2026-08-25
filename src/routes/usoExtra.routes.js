import { Router } from "express";
import { createUsoExtra, getUsosExtra, deleteUsoExtra } from "../controllers/usoExtra.controllers.js";

const router = Router();

router.post("/", createUsoExtra);
router.get("/", getUsosExtra);
router.delete("/:id", deleteUsoExtra);

export default router;
