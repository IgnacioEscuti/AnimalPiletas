import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { IconoArrastre } from "./IconoArrastre.jsx";

const MEDIA_MOBILE = "(max-width: 700px)";
const DURACION_MOBILE = 450;
// Misma curva que --expandir-cliente en index.css (margen, borde y sombra de la card)
const CURVA_MOBILE = [0.32, 0.72, 0, 1];
const EASING_MOBILE = `cubic-bezier(${CURVA_MOBILE.join(", ")})`;

// La misma cubic-bezier como función de JS, para que el scroll avance igual
// que la animación de altura: busca el t de la curva para ese x y devuelve su y.
const crearEasing = (x1, y1, x2, y2) => {
  const bezier = (t, p1, p2) => 3 * p1 * t * (1 - t) ** 2 + 3 * p2 * t ** 2 * (1 - t) + t ** 3;
  return (x) => {
    let desde = 0;
    let hasta = 1;
    let t = x;
    for (let i = 0; i < 20; i++) {
      t = (desde + hasta) / 2;
      if (bezier(t, x1, x2) < x) desde = t;
      else hasta = t;
    }
    return bezier(t, y1, y2);
  };
};
const easingMobile = crearEasing(...CURVA_MOBILE);

// Lleva la fila expandida a scroll-margin-top (120px en mobile) del borde de
// arriba, salvo que la card ya entre completa entre el borde y la tab bar.
// Animado, avanza a la par de la altura y recalcula el destino en cada frame
// (otra card cerrándose arriba corre todo mientras tanto). Si el usuario
// toca o usa la rueda, lo suelta. Devuelve la función para cancelarlo.
const scrollearALaCard = (fila, alturaFinal, animado) => {
  const margenSuperior = parseFloat(getComputedStyle(fila).scrollMarginTop) || 0;
  const topInicial = fila.getBoundingClientRect().top;
  const limiteInferior =
    document.querySelector(".main-nav")?.getBoundingClientRect().top ?? window.innerHeight;
  if (topInicial >= 0 && topInicial + alturaFinal <= limiteInferior) return null;

  const destino = () => window.scrollY + fila.getBoundingClientRect().top - margenSuperior;
  if (!animado) {
    window.scrollTo(0, destino());
    return null;
  }

  const inicio = window.scrollY;
  const comienzo = performance.now();
  let frame;
  const cancelar = () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("touchstart", cancelar);
    window.removeEventListener("wheel", cancelar);
  };
  const avanzar = (ahora) => {
    const progreso = Math.min((ahora - comienzo) / DURACION_MOBILE, 1);
    window.scrollTo(0, inicio + (destino() - inicio) * easingMobile(progreso));
    if (progreso < 1) frame = requestAnimationFrame(avanzar);
    else cancelar();
  };
  window.addEventListener("touchstart", cancelar, { passive: true });
  window.addEventListener("wheel", cancelar, { passive: true });
  frame = requestAnimationFrame(avanzar);
  return cancelar;
};

const animaEnMobile = () =>
  window.matchMedia(MEDIA_MOBILE).matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ClienteRow({
  cliente,
  temporal,
  grupoKey,
  index,
  limpiezaHoy,
  pastillasHoy,
  extras = [],
  empleadoSemanaHoy,
  onEditar,
  onLimpieza,
  onPastillas,
  estadoPastillas,
  onReintentarPastillas,
  onExtra,
  onEliminarExtra,
  onEmpleado,
  onDragStart,
  onDragOver,
  onDrop,
  onPointerDownDrag,
  arrastrando,
  dragOver,
  expandido,
  onToggleExpandido,
}) {
  const [cantidadPastillas, setCantidadPastillas] = useState(
    pastillasHoy?.cantidad ? String(pastillasHoy.cantidad) : ""
  );
  const [nombreExtra, setNombreExtra] = useState("");
  const [precioExtra, setPrecioExtra] = useState("");
  const [empleado, setEmpleado] = useState(empleadoSemanaHoy?.nombre ?? "");
  const filaRef = useRef(null);
  const grupoRef = useRef(null);
  const tituloRef = useRef(null);
  const alturaAnteriorRef = useRef(null);
  const animacionRef = useRef(null);
  const cancelarScrollRef = useRef(null);

  // En mobile, al colapsar el contenido sigue visible (con fade-out) mientras
  // la card se achica, y recién se oculta al terminar la animación.
  // Se ajusta durante el render para que el primer frame ya lo tenga en cuenta.
  const [cerrando, setCerrando] = useState(false);
  const [expandidoPrevio, setExpandidoPrevio] = useState(expandido);
  if (expandido !== expandidoPrevio) {
    setExpandidoPrevio(expandido);
    setCerrando(!expandido && animaEnMobile());
  }

  // Al expandir/colapsar, anima la altura desde la que tenía antes hasta la
  // nueva, así la fila se ve abriéndose en vez de aparecer de golpe.
  useLayoutEffect(() => {
    const grupo = grupoRef.current;
    const animacionPrevia = animacionRef.current;
    // Si interrumpe una animación en curso, arranca desde la altura que se ve en pantalla
    const alturaAnterior = animacionPrevia ? grupo.offsetHeight : alturaAnteriorRef.current;
    animacionPrevia?.cancel();
    animacionRef.current = null;
    cancelarScrollRef.current?.();
    cancelarScrollRef.current = null;
    if (alturaAnterior === null) return;

    const mobile = window.matchMedia(MEDIA_MOBILE).matches;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (expandido && mobile) scrollearALaCard(filaRef.current, grupo.offsetHeight, false);
      return;
    }

    // Colapsando en mobile el contenido todavía está visible: el destino es solo la fila título
    const alturaNueva = !expandido && mobile ? tituloRef.current.offsetHeight : grupo.offsetHeight;
    if (alturaAnterior === alturaNueva) return;

    grupo.style.overflow = "hidden";
    const animacion = grupo.animate(
      [{ height: `${alturaAnterior}px` }, { height: `${alturaNueva}px` }],
      mobile
        ? { duration: DURACION_MOBILE, easing: EASING_MOBILE }
        : { duration: 280, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
    );
    animacionRef.current = animacion;
    animacion.oncancel = () => {
      grupo.style.overflow = "";
    };
    animacion.onfinish = () => {
      animacionRef.current = null;
      grupo.style.overflow = "";
      // flushSync: oculta el contenido antes del próximo frame, sin que se vea un salto
      if (!expandido) flushSync(() => setCerrando(false));
      alturaAnteriorRef.current = grupo.offsetHeight;
    };
    if (expandido && mobile) {
      cancelarScrollRef.current = scrollearALaCard(filaRef.current, alturaNueva, true);
    }
  }, [expandido]);

  // Guarda la altura después de cada render: es el "antes" del próximo cambio.
  useLayoutEffect(() => {
    if (animacionRef.current) return;
    alturaAnteriorRef.current = grupoRef.current.offsetHeight;
  });

  // Si el componente se desmonta a mitad de una animación, no la deja colgada
  useEffect(
    () => () => {
      animacionRef.current?.cancel();
      cancelarScrollRef.current?.();
    },
    []
  );

  // Mientras haya un valor sin confirmar, manda lo que cargó el encargado.
  useEffect(() => {
    if (estadoPastillas === "pendiente" || estadoPastillas === "error") return;
    setCantidadPastillas(pastillasHoy?.cantidad ? String(pastillasHoy.cantidad) : "");
  }, [pastillasHoy?.cantidad, estadoPastillas]);

  useEffect(() => {
    setEmpleado(empleadoSemanaHoy?.nombre ?? "");
  }, [empleadoSemanaHoy?.nombre]);

  const handleBlurExtra = () => {
    if (!nombreExtra || !precioExtra) return;
    onExtra(cliente.id, nombreExtra, Number(precioExtra), empleado);
    setNombreExtra("");
    setPrecioExtra("");
  };

  const ajustarPastillas = (delta) => {
    const nuevo = Math.max(0, (Number(cantidadPastillas) || 0) + delta);
    setCantidadPastillas(String(nuevo));
    onPastillas(cliente.id, nuevo, empleado);
  };

  const handleCambioPastillas = (event) => {
    setCantidadPastillas(event.target.value);
    onPastillas(cliente.id, Math.max(0, Number(event.target.value) || 0), empleado);
  };

  const estadoLimpieza =
    limpiezaHoy?.realizada === true ? "tick" : limpiezaHoy?.realizada === false ? "cross" : "pendiente";
  const simboloEstado = estadoLimpieza === "tick" ? "✓" : estadoLimpieza === "cross" ? "✕" : "–";

  return (
    <div ref={grupoRef} className="fila-cliente-grupo">
      <motion.div
        ref={filaRef}
        className={`fila-cliente row-motion ${expandido ? "expandido" : ""} ${cerrando ? "cerrando" : ""} ${
          arrastrando ? "arrastrando" : ""
        } ${
          dragOver ? "drag-over" : ""
        }`}
        data-cliente-id={cliente.id}
        data-grupo={grupoKey}
        inert={temporal}
        onDragOver={onDragOver}
        onDrop={onDrop}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: arrastrando ? 0.4 : temporal ? 0.5 : 1, y: 0 }}
        transition={{ duration: 0.2, delay: Math.min(index ?? 0, 10) * 0.03 }}
      >
        <div
          ref={tituloRef}
          className="celda celda-titulo"
          onClick={onToggleExpandido}
          title={expandido ? "Colapsar" : "Expandir"}
        >
          <span
            className="drag-handle"
            draggable
            onDragStart={onDragStart}
            onPointerDown={(event) => onPointerDownDrag?.(event, cliente.id, grupoKey)}
            title="Mantené presionado para reordenar"
          >
            <IconoArrastre />
          </span>
          <span className={`estado-punto estado-${estadoLimpieza}`} aria-hidden="true">
            {simboloEstado}
          </span>
          <span className={`chevron ${expandido ? "chevron-abierto" : ""}`} aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </span>
          <span className="cliente-nombre">{cliente.nombre}</span>
          <span className="td-titulo-derecha">
            {pastillasHoy?.cantidad > 0 && (
              <span className="badge-pastillas">{pastillasHoy.cantidad} past.</span>
            )}
          </span>
        </div>
        <div className="celda" data-label="Limpieza de hoy">
          <div className="limpieza-buttons">
            <button
              className={`icon-button ${limpiezaHoy?.realizada === true ? "active-tick" : ""}`}
              onClick={() => onLimpieza(cliente.id, true, empleado)}
              title="Limpieza realizada"
            >
              <span className="limpieza-icono" aria-hidden="true">
                ✓
              </span>
              <span className="limpieza-label">Confirmar</span>
            </button>
            <button
              className={`icon-button ${limpiezaHoy?.realizada === false ? "active-cross" : ""}`}
              onClick={() => onLimpieza(cliente.id, false, empleado)}
              title="Limpieza no realizada"
            >
              <span className="limpieza-icono" aria-hidden="true">
                ✕
              </span>
              <span className="limpieza-label">No se pudo</span>
            </button>
          </div>
        </div>
        <div className="celda celda-pastillas">
          <span className="pastillas-label">Pastillas cargadas</span>
          <div className="pastillas-control">
            <div className="pastillas-stepper">
              <button type="button" className="stepper-btn" onClick={() => ajustarPastillas(-1)}>
                −
              </button>
              <input
                type="number"
                min="0"
                placeholder="0"
                className={`pastillas-input ${estadoPastillas ? `pastillas-${estadoPastillas}` : ""}`}
                value={cantidadPastillas}
                onChange={handleCambioPastillas}
              />
              <button type="button" className="stepper-btn" onClick={() => ajustarPastillas(1)}>
                +
              </button>
            </div>
            <AnimatePresence>
              {estadoPastillas === "guardado" && (
                <motion.span
                  key="guardado"
                  className="pastillas-marca pastillas-marca-guardado"
                  aria-label="Guardado"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  ✓
                </motion.span>
              )}
              {estadoPastillas === "error" && (
                <motion.button
                  key="error"
                  type="button"
                  className="pastillas-marca pastillas-marca-error"
                  onClick={() => onReintentarPastillas(cliente.id)}
                  aria-label="No se pudo guardar. Reintentar"
                  title="No se pudo guardar. Tocá para reintentar"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  !
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="celda" data-label="Extra de hoy">
          <div className="extra-columna">
            <div className="extra-inputs">
              <input
                type="text"
                placeholder="Extra"
                value={nombreExtra}
                onChange={(event) => setNombreExtra(event.target.value)}
                onBlur={handleBlurExtra}
              />
              <input
                type="number"
                min="0"
                placeholder="Precio"
                value={precioExtra}
                onChange={(event) => setPrecioExtra(event.target.value)}
                onBlur={handleBlurExtra}
              />
            </div>
            {extras.length > 0 && (
              <div className="extra-chips">
                {extras.map((extra) => (
                  <span key={extra.id} className="extra-chip">
                    <span className="extra-chip-nombre">{extra.nombreExtra}</span>
                    <span className="extra-chip-precio">${extra.precioUnitario}</span>
                    <button
                      type="button"
                      className="extra-chip-cerrar"
                      onClick={() => onEliminarExtra(extra.id)}
                      aria-label={`Eliminar ${extra.nombreExtra}`}
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="celda" data-label="Empleado">
          <div className="empleado-columna">
            <input
              type="text"
              placeholder="Empleado"
              className="empleado-input"
              value={empleado}
              onChange={(event) => setEmpleado(event.target.value)}
              onBlur={() => onEmpleado(cliente.id, empleado)}
            />
          </div>
        </div>
        <div className="celda celda-accion">
          <button className="btn-outline-accent" onClick={() => onEditar(cliente)}>
            <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M227.32,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.32,96A16,16,0,0,0,227.32,73.37ZM192,88,168,64l16-16,24,24ZM48,172.69,152,68.69,171.31,88,67.31,192H48Z" />
            </svg>
            Editar cliente
          </button>
        </div>
      </motion.div>
      {(expandido || cerrando) && (
        <div className="fila-expandida">
          <div className="detalle-cliente">
            <span className="detalle-item">
              <svg
                className="detalle-icono"
                width="14"
                height="14"
                viewBox="0 0 256 256"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80,132,83.41,134.36a8,8,0,0,0,9.18,0C136,236,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,120a32,32,0,1,1,32-32A32,32,0,0,1,128,136Z" />
              </svg>
              {cliente.direccion || "—"}
            </span>
            <span className="detalle-item">
              <svg
                className="detalle-icono"
                width="14"
                height="14"
                viewBox="0 0 256 256"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l0-.12L97.54,33.63a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.89-48.92A16,16,0,0,0,222.37,158.46Z" />
              </svg>
              {cliente.telefono || "—"}
            </span>
          </div>
          <button
            type="button"
            className="btn-outline-accent btn-editar-mobile"
            onClick={() => onEditar(cliente)}
          >
            <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M227.32,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.32,96A16,16,0,0,0,227.32,73.37ZM192,88,168,64l16-16,24,24ZM48,172.69,152,68.69,171.31,88,67.31,192H48Z" />
            </svg>
            Editar cliente
          </button>
        </div>
      )}
    </div>
  );
}
