import { useState } from "react";

export function PrecioPastillasRow({ precioPastillas, onActualizar }) {
  const [editando, setEditando] = useState(false);
  const [precioEdit, setPrecioEdit] = useState("");

  const iniciarEdicion = () => {
    setPrecioEdit(String(precioPastillas.precio));
    setEditando(true);
  };

  const cancelarEdicion = () => setEditando(false);

  const guardarEdicion = async () => {
    await onActualizar(Number(precioEdit));
    setEditando(false);
  };

  return (
    <li className="row">
      {editando ? (
        <>
          <span className="row-name">Pastillas</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={precioEdit}
            onChange={(event) => setPrecioEdit(event.target.value)}
          />
          <div className="row-actions">
            <button onClick={guardarEdicion}>Guardar</button>
            <button className="secondary" onClick={cancelarEdicion}>
              Cancelar
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="row-info">
            <span className="row-name">Pastillas</span>
            <span className="row-price">${precioPastillas.precio}</span>
          </div>
          <div className="row-actions">
            <button className="secondary" onClick={iniciarEdicion}>
              Editar
            </button>
          </div>
        </>
      )}
    </li>
  );
}
