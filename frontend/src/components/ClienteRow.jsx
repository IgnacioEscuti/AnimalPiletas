import { useState, useEffect } from "react";

export function ClienteRow({
  cliente,
  limpiezaHoy,
  pastillasHoy,
  extraHoy,
  onEditar,
  onLimpieza,
  onPastillas,
  onExtra,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const [cantidadPastillas, setCantidadPastillas] = useState(
    pastillasHoy?.cantidad ? String(pastillasHoy.cantidad) : ""
  );
  const [nombreExtra, setNombreExtra] = useState("");
  const [precioExtra, setPrecioExtra] = useState("");
  const [empleado, setEmpleado] = useState("");
  const [expandido, setExpandido] = useState(false);

  useEffect(() => {
    setCantidadPastillas(pastillasHoy?.cantidad ? String(pastillasHoy.cantidad) : "");
  }, [pastillasHoy?.cantidad]);

  const handleBlurExtra = async () => {
    if (!nombreExtra || !precioExtra) return;
    await onExtra(cliente.id, nombreExtra, Number(precioExtra), empleado);
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
    <>
      <tr
        className={`fila-cliente ${expandido ? "expandido" : ""}`}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <td className="td-titulo">
          <span
            className="drag-handle"
            draggable
            onDragStart={onDragStart}
            title="Arrastrar para reordenar"
          >
            ⠿
          </span>
          <span className={`estado-punto estado-${estadoLimpieza}`} aria-hidden="true">
            {simboloEstado}
          </span>
          <span className="cliente-nombre">{cliente.nombre}</span>
          <span className="td-titulo-derecha">
            {pastillasHoy?.cantidad > 0 && (
              <span className="badge-pastillas">{pastillasHoy.cantidad}</span>
            )}
            <button
              type="button"
              className="chevron-button"
              onClick={() => setExpandido((valor) => !valor)}
              title={expandido ? "Colapsar" : "Expandir"}
            >
              <span className={`chevron ${expandido ? "chevron-abierto" : ""}`}>▸</span>
            </button>
          </span>
        </td>
        <td data-label="Limpieza">
          <div className="limpieza-buttons">
            <button
              className={`icon-button ${limpiezaHoy?.realizada === true ? "active-tick" : ""}`}
              onClick={() => onLimpieza(cliente.id, true, empleado)}
              title="Limpieza realizada"
            >
              ✓
            </button>
            <button
              className={`icon-button ${limpiezaHoy?.realizada === false ? "active-cross" : ""}`}
              onClick={() => onLimpieza(cliente.id, false, empleado)}
              title="Limpieza no realizada"
            >
              ✕
            </button>
          </div>
        </td>
        <td data-label="Pastillas">
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
        <td data-label="Extra">
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
          {extraHoy && (
            <p className="extra-hoy">
              Hoy: {extraHoy.nombreExtra} (${extraHoy.precioUnitario})
            </p>
          )}
        </td>
        <td data-label="Empleado">
          <input
            type="text"
            placeholder="Empleado"
            className="empleado-input"
            value={empleado}
            onChange={(event) => setEmpleado(event.target.value)}
          />
        </td>
        <td className="td-accion">
          <button className="secondary" onClick={() => onEditar(cliente)}>
            Editar
          </button>
        </td>
      </tr>
      {expandido && (
        <tr className="fila-expandida">
          <td colSpan="100%">
            <div className="detalle-cliente">
              <span>
                <strong>Tarifa:</strong>{" "}
                <span className="badge">{cliente.tarifaLimpieza?.nombre}</span>
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
            <button type="button" className="secondary btn-editar-mobile" onClick={() => onEditar(cliente)}>
              Editar
            </button>
          </td>
        </tr>
      )}
    </>
  );
}
