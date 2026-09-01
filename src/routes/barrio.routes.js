import { Router } from "express";
import {
  createBarrio,
  getBarrios,
  reordenarBarrios,
  deleteBarrio,
} from "../controllers/barrio.controllers.js";

const router = Router();

router.post("/", createBarrio);
router.get("/", getBarrios);
router.put("/reordenar", reordenarBarrios);
router.delete("/:id", deleteBarrio);

export default router;
