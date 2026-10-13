import { useState } from "react";

// Misma tarjeta expandida de ClienteRow, pero sin guardar nada al tocar ni
// en onBlur: todo junta en estado local y sale en un solo POST con "Guardar".
export function AdicionalTarjeta({ cliente, puedeEditar, onEditar, onGuardar, onVolver }) {
  const [realizada, setRealizada] = useState(null);
  const [cantidadPastillas, setCantidadPastillas] = useState("");
  const [nombreExtra, setNombreExtra] = useState("");
  const [precioExtra, setPrecioExtra] = useState("");
  const [extras, setExtras] = useState([]);
  const [empleado, setEmpleado] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const extraPendiente = nombreExtra.trim() && precioExtra !== "";

  const agregarExtra = () => {
    if (!extraPendiente) return;
    setExtras((actuales) => [...actuales, { nombre: nombreExtra.trim(), precio: Number(precioExtra) }]);
    setNombreExtra("");
    setPrecioExtra("");
  };

  const ajustarPastillas = (delta) => {
    setCantidadPastillas(String(Math.max(0, (Number(cantidadPastillas) || 0) + delta)));
  };

  const handleGuardar = async () => {
    setEnviando(true);
    setError("");
    try {
      // Si quedó un extra escrito sin pasar a chip, se guarda igual.
      const extrasFinales = extraPendiente
        ? [...extras, { nombre: nombreExtra.trim(), precio: Number(precioExtra) }]
        : extras;
      await onGuardar({
        cliente: cliente.id,
        realizada,
        extra: 0,
        cantidadPastillas: Math.max(0, Number(cantidadPastillas) || 0),
        extras: extrasFinales,
        empleado: empleado.trim(),
      });
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo guardar la limpieza adicional.");
      setEnviando(false);
    }
  };

  return (
    <>
      <div className="adicional-tarjeta">
        <div className="adicional-titulo">
          <button type="button" className="adicional-volver" onClick={onVolver} aria-label="Volver al buscador">
            <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
            </svg>
          </button>
          <span className="estado-punto estado-pendiente" aria-hidden="true">
            –
          </span>
          <span className="cliente-nombre">{cliente.nombre}</span>
        </div>

        <div className="adicional-campo" data-label="Limpieza de hoy">
          <div className="limpieza-buttons">
            <button
              type="button"
              className={`icon-button ${realizada === true ? "active-tick" : ""}`}
              onClick={() => setRealizada(true)}
            >
              <span className="limpieza-icono" aria-hidden="true">
                ✓
              </span>
              <span className="limpieza-label">{realizada === true ? "Confirmada" : "Confirmar"}</span>
            </button>
            <button
              type="button"
              className={`icon-button ${realizada === false ? "active-cross" : ""}`}
              onClick={() => setRealizada(false)}
            >
              <span className="limpieza-icono" aria-hidden="true">
                ✕
              </span>
              <span className="limpieza-label">No se pudo</span>
            </button>
          </div>
        </div>

        <div className="adicional-pastillas">
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
            />
            <button type="button" className="stepper-btn" onClick={() => ajustarPastillas(1)}>
              +
            </button>
          </div>
        </div>

        <div className="adicional-campo" data-label="Extra de hoy">
          <div className="extra-columna">
            <div className="extra-inputs">
              <input
                type="text"
                placeholder="Extra"
                value={nombreExtra}
                onChange={(event) => setNombreExtra(event.target.value)}
                onBlur={agregarExtra}
              />
              <input
                type="number"
                min="0"
                placeholder="Precio"
                value={precioExtra}
                onChange={(event) => setPrecioExtra(event.target.value)}
                onBlur={agregarExtra}
              />
            </div>
            {extras.length > 0 && (
              <div className="extra-chips">
                {extras.map((extra, index) => (
                  <span key={index} className="extra-chip">
                    <span className="extra-chip-nombre">{extra.nombre}</span>
                    <span className="extra-chip-precio">${extra.precio}</span>
                    <button
                      type="button"
                      className="extra-chip-cerrar"
                      onClick={() => setExtras((actuales) => actuales.filter((_, i) => i !== index))}
                      aria-label={`Quitar ${extra.nombre}`}
                      title="Quitar"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="adicional-campo" data-label="Empleado">
          <div className="empleado-columna">
            <input
              type="text"
              placeholder="Empleado"
              className="empleado-input"
              value={empleado}
              onChange={(event) => setEmpleado(event.target.value)}
            />
          </div>
        </div>

        <div className="detalle-cliente">
          <span className="detalle-item">
            <svg className="detalle-icono" width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80,132,83.41,134.36a8,8,0,0,0,9.18,0C136,236,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,120a32,32,0,1,1,32-32A32,32,0,0,1,128,136Z" />
            </svg>
            {cliente.direccion || "—"}
          </span>
          <span className="detalle-item">
            <svg className="detalle-icono" width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l0-.12L97.54,33.63a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.89-48.92A16,16,0,0,0,222.37,158.46Z" />
            </svg>
            {cliente.telefono || "—"}
          </span>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="adicional-acciones">
        {puedeEditar && (
          <button type="button" className="btn-outline-accent" onClick={() => onEditar(cliente.id)}>
            <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M227.32,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.32,96A16,16,0,0,0,227.32,73.37ZM192,88,168,64l16-16,24,24ZM48,172.69,152,68.69,171.31,88,67.31,192H48Z" />
            </svg>
            Editar
          </button>
        )}
        <button type="button" onClick={handleGuardar} disabled={realizada === null || enviando}>
          Guardar
        </button>
      </div>
    </>
  );
}
