import express from "express";
import cors from "cors";
import clienteRoutes from "./routes/cliente.routes.js";
import tarifaLimpiezaRoutes from "./routes/tarifaLimpieza.routes.js";
import precioPastillasRoutes from "./routes/precioPastillas.routes.js";
import limpiezaRoutes from "./routes/limpieza.routes.js";
import usoPastillasRoutes from "./routes/usoPastillas.routes.js";
import usoExtraRoutes from "./routes/usoExtra.routes.js";
import resumenRoutes from "./routes/resumen.routes.js";
import { errorHandler } from "./middlewares/error.middlewares.js";
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
  })
);
app.use(express.json());

app.use("/api/clientes", clienteRoutes);
app.use("/api/tarifas-limpieza", tarifaLimpiezaRoutes);
app.use("/api/precio-pastillas", precioPastillasRoutes);
app.use("/api/limpiezas", limpiezaRoutes);
app.use("/api/usos-pastillas", usoPastillasRoutes);
app.use("/api/usos-extra", usoExtraRoutes);
app.use("/api/resumen", resumenRoutes);

app.use(errorHandler);

export default app;
