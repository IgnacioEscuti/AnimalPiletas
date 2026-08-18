import { useState, useEffect } from "react";

export function ClienteModal({
  cliente,
  tarifas,
  barrios,
  usuarios,
  esAdmin,
  onClose,
  onGuardar,
  onCancelar,
}) {
  const [nombre, setNombre] = useState(cliente?.nombre ?? "");
  const [direccion, setDireccion] = useState(cliente?.direccion ?? "");
  const [telefono, setTelefono] = useState(cliente?.telefono ?? "");
  const [tarifaLimpieza, setTarifaLimpieza] = useState(cliente?.tarifaLimpieza?.id ?? "");
  const [semana, setSemana] = useState(cliente?.semana ?? "1");
  const [barrio, setBarrio] = useState(cliente?.barrio?.id ?? "");
  const [encargado, setEncargado] = useState(cliente?.encargado?.id ?? "");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  // Si el modal se abre para crear un cliente antes de que las tarifas
  // terminen de cargar (tarifas=[] al montar), no hay nada que
  // preseleccionar todavía — este efecto completa el valor apenas
  // llegan, en vez de quedar con "" para siempre (el bug: useState solo
  // lee su valor inicial una vez, en el montaje).
  useEffect(() => {
    if (!tarifaLimpieza && tarifas.length > 0) {
      setTarifaLimpieza(tarifas[0].id);
    }
  }, [tarifas, tarifaLimpieza]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setEnviando(true);
    setError("");
    try {
      const datos = { nombre, direccion, telefono, tarifaLimpieza, semana, barrio: barrio || null };
      if (esAdmin) {
        datos.encargado = encargado || null;
      }
      await onGuardar(datos);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo guardar el cliente.");
      setEnviando(false);
    }
  };

  const handleCancelarCliente = async () => {
    const confirmado = window.confirm(
      `¿Cancelar a ${cliente.nombre}? Va a dejar de aparecer en la lista.`
    );
    if (!confirmado) return;

    setEnviando(true);
    setError("");
    try {
      await onCancelar(cliente.id);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo cancelar el cliente.");
      setEnviando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <h2>{cliente ? "Editar cliente" : "Nuevo cliente"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Dirección (opcional)"
            value={direccion}
            onChange={(event) => setDireccion(event.target.value)}
          />
          <input
            type="text"
            placeholder="Teléfono (opcional)"
            value={telefono}
            onChange={(event) => setTelefono(event.target.value)}
          />
          <select
            value={tarifaLimpieza}
            onChange={(event) => setTarifaLimpieza(event.target.value)}
            required
          >
            {tarifas.map((tarifa) => (
              <option key={tarifa.id} value={tarifa.id}>
                {tarifa.nombre} (${tarifa.precio})
              </option>
            ))}
          </select>
          <select value={semana} onChange={(event) => setSemana(event.target.value)} required>
            <option value="1">Semana 1</option>
            <option value="2">Semana 2</option>
            <option value="todas">Todas las semanas</option>
            <option value="unaVez">Una vez</option>
          </select>
          <select value={barrio} onChange={(event) => setBarrio(event.target.value)}>
            <option value="">Sin barrio</option>
            {barrios.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nombre}
              </option>
            ))}
          </select>
          {esAdmin && (
            <select
              value={encargado}
              onChange={(event) => setEncargado(event.target.value)}
              required
            >
              <option value="" disabled>
                Elegir encargado
              </option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre || u.email}
                  {u.rol === "admin" ? " (admin)" : ""}
                </option>
              ))}
            </select>
          )}
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={enviando}>
              Guardar
            </button>
          </div>
        </form>
        {cliente && (
          <button
            type="button"
            className="danger modal-cancelar-cliente"
            onClick={handleCancelarCliente}
            disabled={enviando}
          >
            Cancelar cliente
          </button>
        )}
      </div>
    </div>
  );
}
