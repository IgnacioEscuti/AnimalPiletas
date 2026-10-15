import { useState } from "react";
import { motion } from "framer-motion";
import { listaExtras, textoParaCopiar } from "../utils/resumen.js";

export function ResumenTable({ filas, periodo, tab, inicioISO }) {
  const [copiadoId, setCopiadoId] = useState(null);

  const handleCopiar = async (fila) => {
    try {
      await navigator.clipboard.writeText(textoParaCopiar(fila, { tab, periodo, inicioISO }));
      setCopiadoId(fila.clienteId);
      setTimeout(() => setCopiadoId(null), 1200);
    } catch {
      // portapapeles no disponible (permisos, contexto no seguro, etc.)
    }
  };

  if (filas.length === 0) {
    return <p className="empty-state">No hay clientes para mostrar.</p>;
  }

  return (
    <table className="resumen-table">
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Limpieza</th>
          <th>Pastillas</th>
          <th>Extra</th>
          {tab !== "mensual" && <th>Empleado</th>}
          <th>Total</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {filas.map((fila, index) => (
          <motion.tr
            key={fila.clienteId}
            className="row-motion"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
          >
            <td className="td-titulo">{fila.clienteNombre}</td>
            <td data-label="Limpieza">
              <div>{fila.limpieza.cantidad}</div>
              <div className="row-price">${fila.limpieza.precio}</div>
            </td>
            <td data-label="Pastillas">
              <div>{fila.pastillas.cantidad}</div>
              <div className="row-price">${fila.pastillas.precio}</div>
            </td>
            <td data-label="Extra">
              <div>{listaExtras(fila.extra.extras)}</div>
              <div className="row-price">${fila.extra.precio}</div>
            </td>
            {tab !== "mensual" && <td data-label="Empleado">{fila.empleados || "—"}</td>}
            <td data-label="Total">
              <strong>${fila.totalGeneral}</strong>
            </td>
            <td className="td-accion">
              <button className="secondary copiar-btn" onClick={() => handleCopiar(fila)}>
                {copiadoId === fila.clienteId ? "¡Copiado!" : "Copiar"}
              </button>
            </td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  );
}
