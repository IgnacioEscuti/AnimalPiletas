import { Router } from "express";
import { registrar, login, logout, getUsuarioActual } from "../controllers/auth.controllers.js";
import { validarRegistro, validarLogin } from "../middlewares/validacion.middlewares.js";
import { authenticateRegistro, authenticateLogin } from "../middlewares/passport.middlewares.js";
import { identificarUsuarioOpcional } from "../middlewares/auth.middlewares.js";
import { limiterLogin, limiterRegistro } from "../middlewares/rateLimit.middlewares.js";

const router = Router();

router.post("/registro", limiterRegistro, validarRegistro, authenticateRegistro, registrar);
router.post("/login", limiterLogin, validarLogin, authenticateLogin, login);
router.post("/logout", logout);
router.get("/actual", identificarUsuarioOpcional, getUsuarioActual);

export default router;
