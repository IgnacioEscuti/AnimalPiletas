import { useState } from "react";
import { useBloquearScroll } from "../hooks/useBloquearScroll.js";

export function TarifaModal({ onClose, onGuardar }) {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");

  useBloquearScroll();

  const handleSubmit = (event) => {
    event.preventDefault();
    onGuardar(nombre.trim(), Number(precio));
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
          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
