import { motion } from "framer-motion";
import { X } from "lucide-react";

const esTemporal = (barrio) => barrio.id.startsWith("temp-");

export function BarrioList({ barrios, onEliminar }) {
  return barrios.map((barrio, index) => (
    <motion.li
      className="chip-barrio"
      key={barrio.claveRender ?? barrio.id}
      inert={esTemporal(barrio)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: esTemporal(barrio) ? 0.5 : 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      <span>{barrio.nombre}</span>
      <button
        className="chip-barrio-eliminar"
        title={`Eliminar ${barrio.nombre}`}
        aria-label={`Eliminar ${barrio.nombre}`}
        onClick={() => onEliminar(barrio)}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </motion.li>
  ));
}
