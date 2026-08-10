import { useState, useEffect } from "react";

export function ClienteRow({
  cliente,
  limpiezaHoy,
  pastillasHoy,
  productoHoy,
  onEditar,
  onLimpieza,
  onPastillas,
  onProducto,
  onSemana,
}) {
  const [cantidadPastillas, setCantidadPastillas] = useState(
    pastillasHoy?.cantidad ? String(pastillasHoy.cantidad) : ""
  );
  const [nombreProducto, setNombreProducto] = useState("");
  const [precioProducto, setPrecioProducto] = useState("");

  useEffect(() => {
    setCantidadPastillas(pastillasHoy?.cantidad ? String(pastillasHoy.cantidad) : "");
  }, [pastillasHoy?.cantidad]);

  const handleBlurProducto = async () => {
    if (!nombreProducto || !precioProducto) return;
    await onProducto(cliente.id, nombreProducto, Number(precioProducto));
    setNombreProducto("");
    setPrecioProducto("");
  };

  return (
    <tr>
      <td>{cliente.nombre}</td>
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
            onClick={() => onLimpieza(cliente.id, true)}
            title="Limpieza realizada"
          >
            ✓
          </button>
          <button
            className={`icon-button ${limpiezaHoy?.realizada === false ? "active-cross" : ""}`}
            onClick={() => onLimpieza(cliente.id, false)}
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
          onBlur={() => onPastillas(cliente.id, Number(cantidadPastillas) || 0)}
        />
      </td>
      <td>
        <div className="producto-inputs">
          <input
            type="text"
            placeholder="Producto"
            value={nombreProducto}
            onChange={(event) => setNombreProducto(event.target.value)}
            onBlur={handleBlurProducto}
          />
          <input
            type="number"
            min="0"
            placeholder="Precio"
            value={precioProducto}
            onChange={(event) => setPrecioProducto(event.target.value)}
            onBlur={handleBlurProducto}
          />
        </div>
        {productoHoy && (
          <p className="producto-hoy">
            Hoy: {productoHoy.nombreProducto} (${productoHoy.precioUnitario})
          </p>
        )}
      </td>
      <td>
        <button className="secondary" onClick={() => onEditar(cliente)}>
          Editar
        </button>
      </td>
    </tr>
  );
}
