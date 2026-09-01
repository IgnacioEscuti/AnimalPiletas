const ZONA_BORDE = 80;
const VELOCIDAD_MAX = 18;

// Auto-scroll de la ventana mientras se arrastra con el dedo cerca de un borde.
// `alScrollear` se llama después de cada frame que movió el scroll: el dedo
// está quieto pero el contenido se corrió, así que la fila que tiene debajo
// cambió y hay que recalcularla.
export function crearAutoScroll(alScrollear) {
  let frameId = null;
  let posY = 0;

  // 0 fuera de las zonas de borde; hacia ±VELOCIDAD_MAX cuanto más pegado al borde.
  const velocidad = () => {
    if (posY < ZONA_BORDE) return -VELOCIDAD_MAX * (1 - posY / ZONA_BORDE);
    const distanciaAlPie = window.innerHeight - posY;
    if (distanciaAlPie < ZONA_BORDE) return VELOCIDAD_MAX * (1 - distanciaAlPie / ZONA_BORDE);
    return 0;
  };

  const detener = () => {
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null;
  };

  const paso = () => {
    frameId = null;
    const desplazamiento = velocidad();
    if (desplazamiento === 0) return;
    const scrollAntes = window.scrollY;
    window.scrollBy(0, desplazamiento);
    // Llegamos al tope o al fondo de la página: no hay nada más que scrollear.
    if (window.scrollY === scrollAntes) return;
    alScrollear();
    frameId = requestAnimationFrame(paso);
  };

  return {
    actualizar(y) {
      posY = y;
      if (velocidad() === 0) detener();
      else if (frameId === null) frameId = requestAnimationFrame(paso);
    },
    detener,
  };
}
