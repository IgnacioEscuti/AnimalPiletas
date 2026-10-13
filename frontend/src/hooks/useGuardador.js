import { useSyncExternalStore } from "react";
import { crearGuardador } from "../utils/guardador.js";

// Un guardador por tipo de dato y usuario, compartido por toda la sesión.
// Vive fuera del componente para que lo pendiente se siga guardando (y siga
// habiendo un solo pedido en vuelo por id) aunque se cambie de pantalla.
const guardadores = new Map();

export function useGuardador({ nombre, usuarioId, enviar }) {
  const clave = `${nombre}:${usuarioId}`;
  if (!guardadores.has(clave)) {
    guardadores.set(clave, crearGuardador({ nombre, usuarioId, enviar }));
  }
  const guardador = guardadores.get(clave);
  const estados = useSyncExternalStore(guardador.suscribir, guardador.getEstados);

  return {
    estados,
    guardar: guardador.guardar,
    reintentar: guardador.reintentar,
    restaurar: guardador.restaurar,
  };
}
