import { env } from "../config/env.js";

const OCHO_HORAS_EN_MS = 8 * 60 * 60 * 1000;

export function getCookieOptions() {
  const esProduccion = env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: esProduccion,
    // En producción el frontend (Vercel) y el backend (Render) son dominios distintos,
    // así que la cookie necesita sameSite "none" para viajar en llamadas cross-site.
    // En desarrollo localhost:5173 -> localhost:3000 es same-site, "lax" alcanza.
    sameSite: esProduccion ? "none" : "lax",
    maxAge: OCHO_HORAS_EN_MS,
  };
}
