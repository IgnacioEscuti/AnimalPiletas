import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Copy } from "lucide-react";
import { formatearPrecio, textoParaCopiar } from "../utils/resumen.js";

// Extras que se ven siempre; el resto se despliega con el botón de la izquierda.
const EXTRAS_VISIBLES = 2;

// Cantidad arriba y precio abajo (Limpieza y Pastillas). Con 0, todo en gris.
function CeldaCategoria({ categoria, cantidad, precio }) {
  return (
    <div className={`rt-celda rt-${categoria}${cantidad === 0 ? " rt-cero" : ""}`}>
      <span className="rt-cantidad">{cantidad}</span>
      <span className="rt-precio">{formatearPrecio(precio)}</span>
    </div>
  );
}

function LineaExtra({ extra }) {
  return (
    <div className="rt-extra-linea">
      <span className="rt-extra-nombre">
        {extra.nombre} ×{extra.cantidad}
      </span>
      <span className="rt-precio">{formatearPrecio(extra.precio)}</span>
    </div>
  );
}

function CeldaExtras({ extras }) {
  const [abierto, setAbierto] = useState(false);
  const visibles = extras.slice(0, EXTRAS_VISIBLES);
  const resto = extras.slice(EXTRAS_VISIBLES);

  return (
    <div className="rt-celda-extras rt-extras">
      {/* Sin botón queda un espacio del mismo ancho, así todas las listas
          de extras arrancan a la misma altura horizontal. */}
      {resto.length > 0 ? (
        <button
          type="button"
          className={`rt-extras-toggle${abierto ? " abierto" : ""}`}
          onClick={() => setAbierto((valor) => !valor)}
          aria-expanded={abierto}
          aria-label={abierto ? "Ver menos extras" : `Ver ${resto.length} extras más`}
        >
          <ChevronDown size={16} strokeWidth={2.4} />
        </button>
      ) : (
        <span className="rt-extras-toggle-espacio" />
      )}

      <div className="rt-extras-lista">
        {extras.length === 0 ? (
          <div className="rt-extra-linea">
            <span className="rt-extra-nombre rt-vacio">—</span>
            <span className="rt-precio">{formatearPrecio(0)}</span>
          </div>
        ) : (
          visibles.map((extra) => <LineaExtra key={extra.nombre} extra={extra} />)
        )}

        <AnimatePresence initial={false}>
          {abierto && (
            <motion.div
              className="rt-extras-resto"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {resto.map((extra) => (
                <LineaExtra key={extra.nombre} extra={extra} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Lista de clientes del Resumen en desktop. En mobile se muestra
// ResumenClienteCard; cuál de las dos se ve lo decide el CSS.
export function ResumenTable({ filas, periodo, tab, inicioISO }) {
  const [copiadoId, setCopiadoId] = useState(null);
  const conEmpleado = tab !== "mensual";

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

  // Encabezado y filas comparten las columnas: sin Empleado cambia el grid.
  const claseGrid = `rt-grid${conEmpleado ? "" : " rt-sin-empleado"}`;

  return (
    <div className="resumen-table">
      <div className={`${claseGrid} rt-encabezado`}>
        <span>Cliente</span>
        <span className="rt-limpieza">
          <span className="rt-punto" />
          Limpieza
        </span>
        <span className="rt-pastillas">
          <span className="rt-punto" />
          Pastillas
        </span>
        <span className="rt-extras">
          <span className="rt-punto" />
          Extra
        </span>
        {conEmpleado && <span>Empleado</span>}
        <span>Total</span>
        <span />
      </div>

      {filas.map((fila, index) => (
        <motion.div
          key={fila.clienteId}
          className={`${claseGrid} rt-fila`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.03 }}
        >
          <span className="rt-nombre">{fila.clienteNombre}</span>
          <CeldaCategoria categoria="limpieza" cantidad={fila.limpieza.cantidad} precio={fila.limpieza.precio} />
          <CeldaCategoria categoria="pastillas" cantidad={fila.pastillas.cantidad} precio={fila.pastillas.precio} />
          <CeldaExtras extras={fila.extra.extras} />
          {conEmpleado && (
            <span className={`rt-empleado${fila.empleados ? "" : " rt-vacio"}`}>{fila.empleados || "—"}</span>
          )}
          <span className="rt-total">{formatearPrecio(fila.totalGeneral)}</span>
          <button type="button" className="rt-copiar" onClick={() => handleCopiar(fila)}>
            <Copy size={16} strokeWidth={2} />
            {copiadoId === fila.clienteId ? "¡Copiado!" : "Copiar"}
          </button>
        </motion.div>
      ))}
    </div>
  );
}
