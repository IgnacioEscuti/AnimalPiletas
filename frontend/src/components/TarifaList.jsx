import { useState } from "react";
import { motion } from "framer-motion";

const esTemporal = (tarifa) => tarifa.id.startsWith("temp-");

export function TarifaList({ tarifas, onActualizar, onEliminar }) {
  const [editandoId, setEditandoId] = useState(null);
  const [precioEdit, setPrecioEdit] = useState("");

  const iniciarEdicion = (tarifa) => {
    setEditandoId(tarifa.id);
    setPrecioEdit(String(tarifa.precio));
  };

  const cancelarEdicion = () => setEditandoId(null);

  const guardarEdicion = (id) => {
    setEditandoId(null);
    onActualizar(id, Number(precioEdit));
  };

  const eliminar = (tarifa) => {
    if (!window.confirm(`¿Eliminar la tarifa "${tarifa.nombre}"?`)) return;
    setEditandoId(null);
    onEliminar(tarifa.id);
  };

  return tarifas.map((tarifa, index) => (
    <motion.li
      className="row row-motion"
      key={tarifa.claveRender ?? tarifa.id}
      inert={esTemporal(tarifa)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: esTemporal(tarifa) ? 0.5 : 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
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
            <button className="danger" onClick={() => eliminar(tarifa)}>
              Eliminar
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
    </motion.li>
  ));
}
