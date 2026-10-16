import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { formatearPrecio } from "../utils/resumen.js";

// Fila acordeón de Configuración (tarifas y Pastillas): la fila entera abre
// un panel debajo con el input de precio y las acciones. onEliminar es
// opcional (Pastillas no se puede eliminar).
export function FilaPrecio({
  nombre,
  precio,
  abierta,
  precioEdit,
  onToggle,
  onPrecioEditChange,
  onGuardar,
  onCancelar,
  onEliminar,
}) {
  const reducirMovimiento = useReducedMotion();

  const handleKeyDown = (event) => {
    if (event.key === "Enter") onGuardar();
    if (event.key === "Escape") onCancelar();
  };

  return (
    <>
      <button className="fila-precio-header" aria-expanded={abierta} onClick={onToggle}>
        <span className="fila-precio-nombre">{nombre}</span>
        <span className="fila-precio-valor">{formatearPrecio(precio)}</span>
        <ChevronDown className="fila-precio-chevron" size={18} aria-hidden="true" />
      </button>

      <AnimatePresence initial={false}>
        {abierta && (
          <motion.div
            className="fila-precio-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reducirMovimiento ? 0 : 0.25, ease: "easeOut" }}
          >
            <div className="fila-precio-panel-contenido">
              <input
                type="number"
                min="0"
                step="0.01"
                aria-label={`Precio de ${nombre}`}
                value={precioEdit}
                onChange={(event) => onPrecioEditChange(event.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <div className="fila-precio-acciones">
                <button onClick={onGuardar}>Guardar</button>
                <button className="secondary" onClick={onCancelar}>
                  Cancelar
                </button>
                {onEliminar && (
                  <button className="danger" onClick={onEliminar}>
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
