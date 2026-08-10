import { useState, useEffect } from "react";

export function ClienteModal({ cliente, tarifas, onClose, onGuardar }) {
  const [nombre, setNombre] = useState(cliente?.nombre ?? "");
  const [tarifaLimpieza, setTarifaLimpieza] = useState(cliente?.tarifaLimpieza?.id ?? "");
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
      await onGuardar({ nombre, tarifaLimpieza });
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo guardar el cliente.");
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
      </div>
    </div>
  );
}
