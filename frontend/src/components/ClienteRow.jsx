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
          <button
            type="button"
            className="chevron-button"
            onClick={() => setExpandido((valor) => !valor)}
            title={expandido ? "Ocultar dirección y teléfono" : "Ver dirección y teléfono"}
          >
            <span className={`chevron ${expandido ? "chevron-abierto" : ""}`}>▸</span>
          </button>
          <span className="cliente-nombre">{cliente.nombre}</span>
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
              <span>
                <strong>Dirección:</strong> {cliente.direccion || "—"}
              </span>
              <span>
                <strong>Teléfono:</strong> {cliente.telefono || "—"}
              </span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
