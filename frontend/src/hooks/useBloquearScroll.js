import { useEffect } from "react";

// Bloquea el scroll del body mientras hay un modal abierto: sin esto, en
// mobile el fondo scrollea detrás de la hoja. La clase "modal-abierto" deja
// que el CSS ajuste el fondo del body mientras está en position: fixed.
//
// Al cerrar se restaura lo que había antes (estilos y clase), no se borra:
// así un modal abierto encima de otro (ClienteModal sobre
// LimpiezaAdicionalModal) no le saca el bloqueo al de abajo al cerrarse.
export function useBloquearScroll(activo = true) {
  useEffect(() => {
    if (!activo) return;

    const scrollY = window.scrollY;
    const { overflow, position, width, top } = document.body.style;
    const teniaClase = document.body.classList.contains("modal-abierto");

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${scrollY}px`;
    document.body.classList.add("modal-abierto");

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.position = position;
      document.body.style.width = width;
      document.body.style.top = top;
      document.body.classList.toggle("modal-abierto", teniaClase);
      window.scrollTo(0, scrollY);
    };
  }, [activo]);
}
