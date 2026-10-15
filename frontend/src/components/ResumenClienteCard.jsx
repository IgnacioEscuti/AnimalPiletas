import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Copy } from "lucide-react";
import { formatearPrecio, textoParaCopiar } from "../utils/resumen.js";

// Extras que se ven siempre; el resto aparece con "Ver N más".
const EXTRAS_VISIBLES = 2;

function Fila({ categoria, label, children }) {
  return (
    <div className={`rcc-fila rcc-${categoria}`}>
      <span className="rcc-label">
        <span className="rcc-punto" />
        {label}
      </span>
      <div className="rcc-valores">{children}</div>
    </div>
  );
}

function Linea({ cantidad, precio, vacia = false }) {
  return (
    <div className="rcc-linea">
      <span className={`rcc-cantidad${vacia ? " rcc-vacio" : ""}`}>{cantidad}</span>
      <span className="rcc-precio">{formatearPrecio(precio)}</span>
    </div>
  );
}

// Tarjeta de un cliente del Resumen en mobile. En desktop se muestra la tabla
// (ResumenTable); cuál de las dos se ve lo decide el CSS.
export function ResumenClienteCard({ fila, periodo, tab, inicioISO, index }) {
  const [copiado, setCopiado] = useState(false);
  const [extrasAbiertos, setExtrasAbiertos] = useState(false);

  const extras = fila.extra.extras;
  const visibles = extras.slice(0, EXTRAS_VISIBLES);
  const resto = extras.slice(EXTRAS_VISIBLES);

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(textoParaCopiar(fila, { tab, periodo, inicioISO }));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1200);
    } catch {
      // portapapeles no disponible (permisos, contexto no seguro, etc.)
    }
  };

  const lineaExtra = (extra) => (
    <Linea key={extra.nombre} cantidad={`${extra.nombre} ×${extra.cantidad}`} precio={extra.precio} />
  );

  return (
    <motion.article
      className="resumen-cliente-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
    >
      <h4 className="rcc-nombre">{fila.clienteNombre}</h4>

      <Fila categoria="limpieza" label="Limpieza">
        <Linea cantidad={fila.limpieza.cantidad} precio={fila.limpieza.precio} />
      </Fila>

      <Fila categoria="pastillas" label="Pastillas">
        <Linea cantidad={fila.pastillas.cantidad} precio={fila.pastillas.precio} />
      </Fila>

      <Fila categoria="extras" label="Extra">
        {extras.length === 0 ? (
          <Linea cantidad="—" precio={0} vacia />
        ) : (
          visibles.map(lineaExtra)
        )}

        <AnimatePresence initial={false}>
          {extrasAbiertos && (
            <motion.div
              className="rcc-extras-resto"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {resto.map(lineaExtra)}
            </motion.div>
          )}
        </AnimatePresence>

        {resto.length > 0 && (
          <button
            type="button"
            className={`rcc-ver-mas${extrasAbiertos ? " abierto" : ""}`}
            onClick={() => setExtrasAbiertos((valor) => !valor)}
            aria-expanded={extrasAbiertos}
          >
            {extrasAbiertos ? "Ver menos" : `Ver ${resto.length} más`}
            <ChevronDown size={16} strokeWidth={2.2} />
          </button>
        )}
      </Fila>

      {tab !== "mensual" && (
        <Fila categoria="empleado" label="Empleado">
          <span className={`rcc-empleado-nombre${fila.empleados ? "" : " rcc-vacio"}`}>
            {fila.empleados || "—"}
          </span>
        </Fila>
      )}

      <div className="rcc-total">
        <span className="rcc-total-label">Total</span>
        <span className="rcc-total-valor">{formatearPrecio(fila.totalGeneral)}</span>
      </div>

      <button type="button" className="rcc-copiar" onClick={handleCopiar}>
        <Copy size={18} strokeWidth={2} />
        {copiado ? "¡Copiado!" : "Copiar"}
      </button>
    </motion.article>
  );
}
