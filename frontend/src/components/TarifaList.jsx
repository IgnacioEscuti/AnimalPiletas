import { useState } from "react";
import { motion } from "framer-motion";
import { FilaPrecio } from "./FilaPrecio.jsx";

const esTemporal = (tarifa) => tarifa.id.startsWith("temp-");

export function TarifaList({ tarifas, onActualizar, onEliminar }) {
  const [editandoId, setEditandoId] = useState(null);
  const [precioEdit, setPrecioEdit] = useState("");

  const alternarEdicion = (tarifa) => {
    if (editandoId === tarifa.id) {
      setEditandoId(null);
      return;
    }
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
      className={`fila-precio${editandoId === tarifa.id ? " abierta" : ""}`}
      key={tarifa.claveRender ?? tarifa.id}
      inert={esTemporal(tarifa)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: esTemporal(tarifa) ? 0.5 : 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      <FilaPrecio
        nombre={tarifa.nombre}
        precio={tarifa.precio}
        abierta={editandoId === tarifa.id}
        precioEdit={precioEdit}
        onToggle={() => alternarEdicion(tarifa)}
        onPrecioEditChange={setPrecioEdit}
        onGuardar={() => guardarEdicion(tarifa.id)}
        onCancelar={cancelarEdicion}
        onEliminar={() => eliminar(tarifa)}
      />
    </motion.li>
  ));
}
