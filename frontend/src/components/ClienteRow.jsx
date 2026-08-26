import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function ClienteRow({
  cliente,
  grupoKey,
  index,
  limpiezaHoy,
  pastillasHoy,
  extras = [],
  empleadoSemanaHoy,
  onEditar,
  onLimpieza,
  onPastillas,
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

  useEffect(() => {
    if (!expandido) return;
    if (!window.matchMedia("(max-width: 700px)").matches) return;
    filaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [expandido]);

  useEffect(() => {
    setCantidadPastillas(pastillasHoy?.cantidad ? String(pastillasHoy.cantidad) : "");
  }, [pastillasHoy?.cantidad]);

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

  const estadoLimpieza =
    limpiezaHoy?.realizada === true ? "tick" : limpiezaHoy?.realizada === false ? "cross" : "pendiente";
  const simboloEstado = estadoLimpieza === "tick" ? "✓" : estadoLimpieza === "cross" ? "✕" : "–";

  return (
    <tbody className="fila-cliente-grupo">
      <motion.tr
        ref={filaRef}
        className={`fila-cliente row-motion ${expandido ? "expandido" : ""} ${arrastrando ? "arrastrando" : ""} ${
          dragOver ? "drag-over" : ""
        }`}
        data-cliente-id={cliente.id}
        data-grupo={grupoKey}
        onDragOver={onDragOver}
        onDrop={onDrop}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: arrastrando ? 0.4 : 1, y: 0 }}
        transition={{ duration: 0.2, delay: Math.min(index ?? 0, 10) * 0.03 }}
      >
        <td
          className="td-titulo"
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
            ⠿
          </span>
          <span className={`estado-punto estado-${estadoLimpieza}`} aria-hidden="true">
            {simboloEstado}
          </span>
          <span className={`chevron ${expandido ? "chevron-abierto" : ""}`} aria-hidden="true">
            ▸
          </span>
          <span className="cliente-nombre">{cliente.nombre}</span>
          <span className="td-titulo-derecha">
            {pastillasHoy?.cantidad > 0 && (
              <span className="badge-pastillas">{pastillasHoy.cantidad} past.</span>
            )}
          </span>
        </td>
        <td data-label="Limpieza de hoy">
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
        </td>
        <td>
          <span className="pastillas-label">Pastillas cargadas</span>
          <div className="pastillas-stepper">
            <button type="button" className="stepper-btn" onClick={() => ajustarPastillas(-1)}>
              −
            </button>
            <input
              type="number"
              min="0"
              placeholder="0"
              className="pastillas-input"
              value={cantidadPastillas}
              onChange={(event) => setCantidadPastillas(event.target.value)}
              onBlur={() => onPastillas(cliente.id, Number(cantidadPastillas) || 0, empleado)}
            />
            <button type="button" className="stepper-btn" onClick={() => ajustarPastillas(1)}>
              +
            </button>
          </div>
        </td>
        <td data-label="Extra de hoy">
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
        </td>
        <td data-label="Empleado">
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
        </td>
        <td className="td-accion">
          <button className="btn-outline-accent" onClick={() => onEditar(cliente)}>
            <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M227.32,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.32,96A16,16,0,0,0,227.32,73.37ZM192,88,168,64l16-16,24,24ZM48,172.69,152,68.69,171.31,88,67.31,192H48Z" />
            </svg>
            Editar cliente
          </button>
        </td>
      </motion.tr>
      {expandido && (
        <tr className="fila-expandida">
          <td colSpan="100%">
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
          </td>
        </tr>
      )}
    </tbody>
  );
}
