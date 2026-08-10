import { useState } from "react";

export function TarifaList({ tarifas, onActualizar }) {
  const [editandoId, setEditandoId] = useState(null);
  const [precioEdit, setPrecioEdit] = useState("");

  const iniciarEdicion = (tarifa) => {
    setEditandoId(tarifa.id);
    setPrecioEdit(String(tarifa.precio));
  };

  const cancelarEdicion = () => setEditandoId(null);

  const guardarEdicion = async (id) => {
    await onActualizar(id, Number(precioEdit));
    setEditandoId(null);
  };

  return tarifas.map((tarifa) => (
    <li className="row" key={tarifa.id}>
      {editandoId === tarifa.id ? (
        <>
          <span className="row-name">{tarifa.nombre}</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={precioEdit}
            onChange={(event) => setPrecioEdit(event.target.value)}
          />
          <div className="row-actions">
            <button onClick={() => guardarEdicion(tarifa.id)}>Guardar</button>
            <button className="secondary" onClick={cancelarEdicion}>
              Cancelar
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="row-info">
            <span className="row-name">{tarifa.nombre}</span>
            <span className="row-price">${tarifa.precio}</span>
          </div>
          <div className="row-actions">
            <button className="secondary" onClick={() => iniciarEdicion(tarifa)}>
              Editar
            </button>
          </div>
        </>
      )}
    </li>
  ));
}
