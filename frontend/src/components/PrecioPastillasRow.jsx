import { useState } from "react";
import { FilaPrecio } from "./FilaPrecio.jsx";

export function PrecioPastillasRow({ precioPastillas, onActualizar }) {
  const [editando, setEditando] = useState(false);
  const [precioEdit, setPrecioEdit] = useState("");

  const alternarEdicion = () => {
    if (editando) {
      setEditando(false);
      return;
    }
    setPrecioEdit(String(precioPastillas.precio));
    setEditando(true);
  };

  const cancelarEdicion = () => setEditando(false);

  const guardarEdicion = () => {
    setEditando(false);
    onActualizar(Number(precioEdit));
  };

  return (
    <li className={`fila-precio${editando ? " abierta" : ""}`}>
      <FilaPrecio
        nombre="Pastillas"
        precio={precioPastillas.precio}
        abierta={editando}
        precioEdit={precioEdit}
        onToggle={alternarEdicion}
        onPrecioEditChange={setPrecioEdit}
        onGuardar={guardarEdicion}
        onCancelar={cancelarEdicion}
      />
    </li>
  );
}
