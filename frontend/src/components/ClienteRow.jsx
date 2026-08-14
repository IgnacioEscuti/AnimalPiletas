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
  onSemana,
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

  return (
    <>
      <tr onDragOver={onDragOver} onDrop={onDrop}>
        <td>
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
          {cliente.nombre}
        </td>
        <td>
          <span className="badge">{cliente.tarifaLimpieza?.nombre}</span>
        </td>
        <td>
          <select
            className="semana-select"
            value={cliente.semana}
            onChange={(event) => onSemana(cliente.id, event.target.value)}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="todas">todas</option>
          </select>
        </td>
        <td>
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
        <td>
          <input
            type="number"
            min="0"
            placeholder="0"
            className="pastillas-input"
            value={cantidadPastillas}
            onChange={(event) => setCantidadPastillas(event.target.value)}
            onBlur={() => onPastillas(cliente.id, Number(cantidadPastillas) || 0, empleado)}
          />
        </td>
        <td>
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
        <td>
          <input
            type="text"
            placeholder="Empleado"
            className="empleado-input"
            value={empleado}
            onChange={(event) => setEmpleado(event.target.value)}
          />
        </td>
        <td>
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
