import express from "express";
import cors from "cors";
import clienteRoutes from "./routes/cliente.routes.js";
import tarifaLimpiezaRoutes from "./routes/tarifaLimpieza.routes.js";
import precioPastillasRoutes from "./routes/precioPastillas.routes.js";
import limpiezaRoutes from "./routes/limpieza.routes.js";
import usoPastillasRoutes from "./routes/usoPastillas.routes.js";
import usoProductoRoutes from "./routes/usoProducto.routes.js";
import resumenRoutes from "./routes/resumen.routes.js";
import { errorHandler } from "./middlewares/error.middlewares.js";

const app = express();

// TODO: restringir a origin: process.env.FRONTEND_URL (el dominio de
// Vercel) una vez que el frontend esté deployado. Por ahora queda
// abierto a cualquier origen para no bloquear el deploy inicial.
app.use(cors({
  origin: "animal-piletas-2xt6nygce-ignacioescutis-projects.vercel.app" 
}));
app.use(express.json());

app.use("/api/clientes", clienteRoutes);
app.use("/api/tarifas-limpieza", tarifaLimpiezaRoutes);
app.use("/api/precio-pastillas", precioPastillasRoutes);
app.use("/api/limpiezas", limpiezaRoutes);
app.use("/api/usos-pastillas", usoPastillasRoutes);
app.use("/api/usos-producto", usoProductoRoutes);
app.use("/api/resumen", resumenRoutes);

app.use(errorHandler);

export default app;
