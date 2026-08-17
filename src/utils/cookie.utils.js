import { env } from "../config/env.js";

const OCHO_HORAS_EN_MS = 8 * 60 * 60 * 1000;

export function getCookieOptions() {
  const esProduccion = env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: esProduccion,
    // El frontend llama a /api en su propio dominio (Vercel reenvía internamente
    // al backend en Render vía rewrite), así que desde la perspectiva del navegador
    // el pedido es same-site en todos los entornos. "lax" alcanza.
    sameSite: "lax",
    maxAge: OCHO_HORAS_EN_MS,
  };
}
