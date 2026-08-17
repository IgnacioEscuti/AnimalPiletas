import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./config/passport.config.js";
import authRoutes from "./routes/auth.routes.js";
import clienteRoutes from "./routes/cliente.routes.js";
import tarifaLimpiezaRoutes from "./routes/tarifaLimpieza.routes.js";
import barrioRoutes from "./routes/barrio.routes.js";
import precioPastillasRoutes from "./routes/precioPastillas.routes.js";
import limpiezaRoutes from "./routes/limpieza.routes.js";
import usoPastillasRoutes from "./routes/usoPastillas.routes.js";
import usoExtraRoutes from "./routes/usoExtra.routes.js";
import resumenRoutes from "./routes/resumen.routes.js";
import { errorHandler } from "./middlewares/error.middlewares.js";
import { authenticateActual } from "./middlewares/auth.middlewares.js";
import { env } from "./config/env.js";

const app = express();

const origenesPermitidos = env.FRONTEND_URLS
  ? env.FRONTEND_URLS.split(",").map((url) => url.trim())
  : [];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origenesPermitidos.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origen no permitido por CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);

app.use("/api/clientes", authenticateActual, clienteRoutes);
app.use("/api/tarifas-limpieza", authenticateActual, tarifaLimpiezaRoutes);
app.use("/api/barrios", authenticateActual, barrioRoutes);
app.use("/api/precio-pastillas", authenticateActual, precioPastillasRoutes);
app.use("/api/limpiezas", authenticateActual, limpiezaRoutes);
app.use("/api/usos-pastillas", authenticateActual, usoPastillasRoutes);
app.use("/api/usos-extra", authenticateActual, usoExtraRoutes);
app.use("/api/resumen", authenticateActual, resumenRoutes);

app.use(errorHandler);

export default app;
