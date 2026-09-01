import { useEffect, useState } from "react";

export function TarifaModal({ onClose, onGuardar }) {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  // Mismo bloqueo de scroll del body que usa ClienteModal: sin esto, en
  // mobile el fondo scrollea detrás de la hoja.
  useEffect(() => {
    const scrollY = window.scrollY;
    const { overflow, position, width, top } = document.body.style;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${scrollY}px`;

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.position = position;
      document.body.style.width = width;
      document.body.style.top = top;
      window.scrollTo(0, scrollY);
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setEnviando(true);
    setError("");
    try {
      await onGuardar(nombre.trim(), Number(precio));
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo crear la tarifa.");
      setEnviando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <h2>Nueva tarifa</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            required
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Precio"
            value={precio}
            onChange={(event) => setPrecio(event.target.value)}
            required
          />
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
